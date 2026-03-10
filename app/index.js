const http = require("http");
const {
  Client,
  Intents,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  Permissions,
} = require("discord.js");
const moment = require("moment");
const express = require("express");
const app = express();
const fs = require("fs");
const axios = require("axios");
const util = require("util");
const path = require("path");
const cron = require("node-cron");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
require("dotenv").config();
const client = new Client({
  partials: ["CHANNEL"],
  intents: new Intents(32767),
});
const {
  Modal,
  TextInputComponent,
  SelectMenuComponent,
  showModal,
} = require("discord-modals");
const discordModals = require("discord-modals");
discordModals(client);
const newbutton = (buttondata) => {
  return {
    components: buttondata.map((data) => {
      return {
        custom_id: data.id,
        label: data.label,
        style: data.style || 1,
        url: data.url,
        emoji: data.emoji,
        disabled: data.disabled,
        type: 2,
      };
    }),
    type: 1,
  };
};
process.env.TZ = "Asia/Tokyo";
("use strict");
let guildId;

http
  .createServer(function (request, response) {
    try {
      response.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
      response.end(
        `ログイン`
      );
    } catch (e) {
      console.log(e);
    }
  })
  .listen(8080);

if (process.env.DISCORD_BOT_TOKEN == undefined) {
  console.error("tokenが設定されていません！");
  process.exit(0);
}

client.on("ready", (client) => {
  console.log(`ログイン: ${client.user.tag}`);
  client.user.setActivity({
    type: "PLAYING",
    name: `Develop by @rui06060`,
  });
  client.guilds.cache.size;
  client.user.setStatus("online");
});

client.once("ready", async () => {
  try {
    await client.application.commands.create({
      name: "実績",
      description: "実績送信機能",
      options: [
        {
          type: "CHANNEL",
          name: "チャンネル",
          description: "実績を送信するチャンネル",
          required: true,
          channel_types: [0],
        },
        {
          type: "USER",
          name: "記入者",
          description: "実績の記入者",
          required: true,
        },
        {
          type: "STRING",
          name: "商品名",
          description: "商品名",
          required: true,
        },
        {
          type: "INTEGER",
          name: "評価",
          description: "評価",
          required: true,
        },
        {
          type: "STRING",
          name: "コメント",
          description: "コメント",
          required: true,
        },
        {
          type: "INTEGER",
          name: "個数",
          description: "個数",
          required: true,
        },
      ],
    });
    console.log("Slash Command '実績' registered.");
  } catch (error) {
    console.error(error);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "実績") {
    const targetChannel = interaction.options.getChannel("チャンネル");
    const author = interaction.options.getUser("記入者");
    const itemName = interaction.options.getString("商品名");
    const rating = interaction.options.getInteger("評価");
    const comment = interaction.options.getString("コメント");
    const quantity = interaction.options.getInteger("個数");

    const embed = {
      title: "✨実績報告",
      color: 0x00c4ff,
      thumbnail: {
      url: author.displayAvatarURL({ dynamic: true, format: 'png', size: 1024 })
    },
      fields: [
        { name: "👤 記入者", value: `${author}`, inline: true },
        { name: "🛍️ 商品名", value: itemName, inline: true },
        { name: "📦 個数", value: `${quantity}個`, inline: true },
        { name: "⭐ 評価", value: "★".repeat(Math.min(Math.max(rating, 0), 10)) + ` (${rating})`, inline: false },
        { name: "📄 コメント", value: comment },
      ],
      timestamp: new Date(),
      footer: { text: `M.BOT｜Develop by @rui06060` },
    };

    try {
      await targetChannel.send({ embeds: [embed] });

      await interaction.reply({
        content: `${targetChannel} に実績の送信が完了しました`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "メッセージの送信中にエラーが発生しました。権限を確認してください。",
        ephemeral: true,
      });
    }
  }
});

client.on("messageCreate", async (message) => {
  if (message.content === "m.review") {
    const embed = new MessageEmbed()
      .setTitle("実績報告パネル")
      .setDescription("ボタンを押して実績を報告しましょう！")
      .setColor("BLUE");

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("open_review_modal")
        .setLabel("実績を記入")
        .setStyle("PRIMARY")
    );
    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) {
      return;
    }
    if (interaction.customId.startsWith("open_review_modal")) {
      const customId = `${
        interaction.customId
      }-${interaction.message.embeds[0].fields
        .map((field) => field.name.charAt(0))
        .join("/")}`;
      const modal = new Modal()
        .setCustomId(customId)
        .setTitle("実績入力フォーム")
        .addComponents(
          new TextInputComponent()
            .setCustomId("name")
            .setLabel("商品名")
            .setPlaceholder("商品名を入力")
            .setStyle("SHORT")
            .setRequired(true),
          new TextInputComponent()
            .setCustomId("rate")
            .setLabel("評価 (1-5)")
            .setPlaceholder("例: 5")
            .setStyle("SHORT")
            .setRequired(true),
           new TextInputComponent()
           .setCustomId("quantity")
           .setLabel("個数")
           .setPlaceholder("個数を入力")
           .setStyle("SHORT")
           .setRequired(true),
           new TextInputComponent()
           .setCustomId("comment")
           .setLabel("コメント")
           .setPlaceholder("コメントを入力")
           .setStyle("LONG")
           .setRequired(true)
        );
      showModal(modal, {
        client: client,
        interaction: interaction,
      });
    }
  });

  client.on("modalSubmit", async (interaction) => {
    console.log(interaction.customId);
    if (interaction.customId.startsWith("open_review_modal-")) {
      const [name, rate, quantity, comment] = [
        "name",
        "rate",
        "quantity",
        "comment",
      ].map((id) => interaction.getTextInputValue(id));

    const logChannelId = "1365763128851435633"; 
    const logChannel = await client.channels.fetch(logChannelId).catch(() => null);

    if (!logChannel) {
      return interaction.reply({ content: "送信先チャンネルが見つかりませんでした。", ephemeral: true });
    }

    const reviewEmbed = {
      title: "✨実績報告",
      color: 0x00c4ff,
      thumbnail: {
        url: interaction.user.displayAvatarURL({ dynamic: true, format: 'png', size: 1024 })
      },
      fields: [
        { name: "👤 記入者", value: `<@${interaction.user.id}>`, inline: true },
        { name: "🛍️ 商品名", value: name, inline: true },
        { name: "📦 個数", value: `${quantity}個`, inline: true },
        { name: "⭐ 評価", value: "★".repeat(Math.min(Math.max(Number(rate) || 1, 0), 10)) + ` (${rate})`, inline: false },
        { name: "📄 コメント", value: comment },
      ],
      timestamp: new Date(),
      footer: { text: `M.BOT｜Develop by @rui06060` },
    };

    try {
      await logChannel.send({ embeds: [reviewEmbed] });
      await interaction.reply({
        content: "実績の送信が完了しました",
        ephemeral: true
      });
    } catch (e) {
      console.error(e);
      await interaction.reply({ content: "送信に失敗しました。", ephemeral: true });
    }
    }
  });

process.on('uncaughtException', (error) => {
    console.error('未処理の例外:', error);
    fs.appendFileSync('error.log', `未処理の例外: ${error.stack}\n`);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('未処理の拒否:', reason);
    fs.appendFileSync('error.log', `未処理の拒否: ${reason}\n`);
});

client.login(process.env.DISCORD_BOT_TOKEN);
