const { 
    ChannelType, 
    PermissionsBitField, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    EmbedBuilder 
  } = require('discord.js');
  const fs = require('fs');
  const path = require('path');
  
  module.exports = (client) => {
    const ticketTypes = {
      support: {
        label: "🛠️ Dev Support",
        category: process.env.CATEGORY_SUPPORT_ID,
        role: process.env.ROLE_SUPPORT_ID,
      },
      dev: {
        label: "🧑‍💻 BUY",
        category: process.env.CATEGORY_DEV_ID,
        role: process.env.ROLE_DEV_ID,
      },
      report: {
        label: "🚨 Report An Issue Or Error",
        category: process.env.CATEGORY_REPORT_ID,
        role: process.env.ROLE_REPORT_ID,
      },
    };
  
    // Auto-send ticket panel
    client.once("ready", async () => {
      console.log(`Logged in as ${client.user.tag}`);
  
      const panelChannel = await client.channels.fetch(process.env.PANEL_CHANNEL_ID);
      const row = new ActionRowBuilder().addComponents(
        Object.entries(ticketTypes).map(([id, data]) =>
          new ButtonBuilder()
            .setCustomId(`ticket_${id}`)
            .setLabel(data.label)
            .setStyle(ButtonStyle.Primary)
        )
      );
  
      const embed = new EmbedBuilder()
        .setTitle("🎫 Create a Ticket")
        .setDescription("Choose the category below to open a ticket:")
        .setColor("Blue");
  
      panelChannel.send({ embeds: [embed], components: [row] });
    });
  
    // Handle ticket creation
    client.on("interactionCreate", async (interaction) => {
      if (!interaction.isButton()) return;
  
      const [prefix, type] = interaction.customId.split("_");
      if (prefix !== "ticket" || !ticketTypes[type]) return;
  
      const existing = interaction.guild.channels.cache.find(
        (ch) => ch.topic === interaction.user.id
      );
      if (existing) {
        return interaction.reply({
          content: "You already have an open ticket.",
          ephemeral: true,
        });
      }
  
      const data = ticketTypes[type];
      await interaction.deferReply({ ephemeral: true });
  
      const channel = await interaction.guild.channels.create({
        name: `${type}-ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: data.category,
        topic: interaction.user.id,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
            ],
          },
          {
            id: data.role,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
            ],
          },
        ],
      });
  
      const closeBtn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("close_ticket")
          .setLabel("Close Ticket")
          .setStyle(ButtonStyle.Danger)
      );
  
      const embed = new EmbedBuilder()
        .setTitle(`${data.label} Ticket`)
        .setDescription(
          `Welcome <@${interaction.user.id}>, please explain your issue.`
        )
        .setColor("Blue");
  
      await channel.send({
        content: `<@&${data.role}>`,
        embeds: [embed],
        components: [closeBtn],
      });
  
      // Log the ticket creation to the ticket log channel
      const ticketLogChannel = await client.channels.fetch(
        process.env.TICKET_LOG_CHANNEL_ID
      );
      await ticketLogChannel.send({
        content: `📥 Ticket opened: ${channel.name} by <@${interaction.user.id}>`,
      });
  
      await interaction.editReply({ content: `Ticket created: ${channel}` });
    });
  
    // Handle ticket close
    client.on("interactionCreate", async (interaction) => {
      if (!interaction.isButton() || interaction.customId !== "close_ticket")
        return;
  
      const channel = interaction.channel;
      if (!channel.topic)
        return interaction.reply({ content: "Invalid ticket.", ephemeral: true });
  
      await interaction.reply({
        content: "Closing ticket and generating transcript...",
        ephemeral: true,
      });
  
      const messages = await channel.messages.fetch({ limit: 100 });
      const sorted = messages.sort(
        (a, b) => a.createdTimestamp - b.createdTimestamp
      );
  
      const htmlMessages = sorted
        .map((msg) => {
          const time = new Date(msg.createdTimestamp).toLocaleString();
          return `<div class="message">
            <strong>[${time}] ${msg.author.tag}:</strong>
            <p>${msg.content}</p>
          </div>`;
        })
        .join("\n");
  
      const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${channel.name} Transcript</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #f4f4f4;
              padding: 20px;
            }
            .message {
              background: #fff;
              padding: 10px;
              margin-bottom: 10px;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .message p {
              margin: 5px 0;
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>
          <h2>Transcript: ${channel.name}</h2>
          ${htmlMessages}
        </body>
        </html>
      `;
  
      const filePath = `./transcripts/${channel.name}.html`;
      if (!fs.existsSync("./transcripts")) fs.mkdirSync("./transcripts");
      fs.writeFileSync(filePath, htmlTemplate);
  
      // Log the ticket closure to the ticket log channel
      const ticketLogChannel = await client.channels.fetch(
        process.env.TICKET_LOG_CHANNEL_ID
      );
      await ticketLogChannel.send({
        content: `📁 Ticket closed: ${channel.name}\nTranscript for ticket: ${channel.name}`,
        files: [filePath],
      });
  
      await channel.delete();
    });
  
    // Handle !rename and !stats commands
    client.on("messageCreate", async (message) => {
      if (message.author.bot || !message.guild) return;
  
      const args = message.content.trim().split(/ +/);
      const command = args.shift()?.toLowerCase();
  
      // !rename <new-name>
      if (command === "!rename") {
        const newName = args
          .join("-")
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "");
        if (!newName)
          return message.reply("❌ Please provide a new name for the channel.");
  
        const channel = message.channel;
  
        if (!channel.topic || channel.type !== 0) {
          return message.reply(
            "❌ This command can only be used in ticket channels."
          );
        }
  
        await channel.setName(newName);
        message.reply(`✅ Renamed this channel to \`${newName}\``);
      }
  
      // !stats
      if (command === "!stats") {
        const userId = message.author.id;
        const openTickets = message.guild.channels.cache.filter(
          (ch) => ch.topic === userId
        );
  
        message.reply(`📊 You have **${openTickets.size}** open ticket(s).`);
      }
    });
  };
  