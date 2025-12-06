import express from "express";
import { Client, GatewayIntentBits } from "discord.js";

const app = express();
app.use(express.json());

// Discord Bot
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Botログイン
client.login(process.env.DISCORD_TOKEN);

client.once("ready", () => {
  console.log(`Bot logged in as ${client.user.tag}`);
});

// Base44 → Bot へ部屋作成API
app.post("/create-room", async (req, res) => {
  try {
    const { game_title, party_size } = req.body;

    // 新規サーバー作成
    const guild = await client.guilds.create({
      name: `${game_title} - ${party_size}人募集`
    });

    // 最初のテキストチャンネル
    const channels = await guild.channels.fetch();
    const defaultChannel = channels.find(ch => ch.type === 0);

    // 招待URL
    const invite = await defaultChannel.createInvite({
      maxAge: 3600,
      maxUses: party_size
    });

    res.json({
      invite_url: invite.url,
      guild_id: guild.id
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create room" });
  }
});

// Render で必須：ポート指定
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
