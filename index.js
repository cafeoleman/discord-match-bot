import express from "express";
import { Client, GatewayIntentBits } from "discord.js";

const app = express();
app.use(express.json());

// Discord Botクライアント
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Botログイン
client.login(process.env.DISCORD_TOKEN);

// Base44 → Bot へ部屋作成リクエスト
app.post("/api/create-room", async (req, res) => {
  try {
    const { game_title, party_size } = req.body;

    // 新規サーバーを作成
    const guild = await client.guilds.create({
      name: `${game_title} - ${party_size}人募集`,
    });

    // サーバー内のテキストチャンネル取得
    const channels = await guild.channels.fetch();
    const defaultChannel = channels.find(ch => ch.type === 0);

    // 招待URL作成
    const invite = await defaultChannel.createInvite({
      maxAge: 3600,
      maxUses: party_size,
    });

    res.json({
      invite_url: invite.url,
      guild_id: guild.id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "room creation failed" });
  }
});

// Railway用のHTTPサーバー
app.listen(3000, () => {
  console.log("Bot server running on port 3000");
});
