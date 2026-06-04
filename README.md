# コレ買い！ 公式サイト

地方に眠る “いいもの” を都市へ届け、つくり手を応援する **複数大学の学生団体「コレ買い！」** の公式サイトのソースコードです。

🌐 本番: **https://korekai26.com**

## これは何

- 地方の逸品を、都市のマルシェ・イベントで実際に販売
- 消費者の反応・価格感・購入理由を、つくり手にデータで返す
- イベントと発信で知名度を広げ、地域を盛り上げる

EC の代わりではなく、EC や継続販売につながる “最初の都市接点” をつくる活動です。

## 技術構成

- **静的サイト**（ビルド工程なし）。HTML + CSS + Vanilla JavaScript のみ
- ホスティング: **Cloudflare Pages**
- フォント: Shippori Mincho B1（見出し）/ Fraunces（欧文）/ Noto Sans JP（本文）
- 配色: “Harvest Jewel” パレット（朱赤 #C2351A・金 #FFB22E・ワイン #7A2540 ほか）

## ページ構成

| ファイル | 内容 |
|---|---|
| `index.html` | トップ |
| `about.html` | メンバー紹介 |
| `method.html` | 仕組み詳細 |
| `testmarket.html` | 検証販売について |
| `support.html` | 支援内容の詳細 |
| `products.html` | 取扱事例 |
| `events.html` | イベント（あんず収穫インターン） |
| `producers.html` | 生産者の方へ |
| `contact.html` | お問い合わせ |

共通: `style.css`（全ページ共通スタイル）/ `app.js`（メニュー・スクロール演出など）/ `img/`（画像）

## ローカルで見る

ビルド不要。任意の静的サーバで開くだけ:

```bash
# 例: Python
python -m http.server 8000
# → http://localhost:8000
```

## デプロイ

```bash
wrangler pages deploy . --project-name=korekai --branch=main
```

---

© 2026 KOREKAI
