
# Twitter Highligh Scrapping using Selenium



## API Reference

#### run (starts scrapping)

```http
  GET /run
```

#### REGISTER

```http
  GET /query:id
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `database id`      | `string` | **Required**.  |
|












## Run Locally

### Backend

Clone the project

```bash
  git clone https://github.com/programming-warrior/twitterScraper.git
```

Go to the project directory

```bash
  cd twitterScraper/selenium
```

Install dependencies

```bash
  npm install
```
Set Environment Variables

```bash
TWITTER_USERNAME={username}
TWITTER_PASSWORD={pasword}
MONGO_URL={db_string}
PROXYMESH_USERNAME={proxymesh_username}
PROXYMESH_PASSWORD={proxymesh_password}
```

Start the server

```bash
  npm run dev
```
