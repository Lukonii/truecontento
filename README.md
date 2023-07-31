**Truecontento is 4 in 1 social media content generator powered by AI.**

It creates Content, Images, Voice-over, Captions and combinue in one video.
Site demo: https://www.youtube.com/watch?v=JKaN7OSmnXg

_Idea behind truecontento was to be a startup with main feature to create short videos for social media, but there are a lot of apps in that field, so now it is just a free project_

---

**Front-end stack**

1. javascript
2. HTML
3. CSS
4. Bootstrap

**Back-end stack**

1. Node.js
2. Postgres

## Used API, libraries and 3rd party:

1. Opneai to generate text.
2. Stability.ai to generate images.
3. Elvenlabs to create voice-overs.
4. Google speach-to-text api to generate real-time captions.
5. Ffmpeg library to generate video.
6. Paddle
7. Google

## Features:

1. Authentication and authorization
2. Emails
3. Payments (Paddle integration)

---

## Requirements:

1. clone prod branch
2. cd backend
3. npm install
4. npm run dev

---

## Hosing

truecontento.com is from godaddy

Site was hosted on google cloud - compute engine.

---

## Create DB script

in terminal psql
sudo -u postgres psql

\l
CREATE DATABASE truecontento;

\c truecontento - enter into db
\! cls

CREATE TABLE users (
id SERIAL PRIMARY KEY,
email VARCHAR(255) UNIQUE NOT NULL,
password TEXT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
login_type character varying(8),
verified character varying(8),
verify_token character varying(40),
referral CHAR(8)
);

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

INSERT INTO users (email, password, login_type, verified, verify_token) VALUES ('johnsmith@example.com', crypt('password123', gen_salt('bf')),'standard', 'true', '5f26abc431c6a52908e792cdbd25238f5dd161e4');

CREATE TABLE userCredits (
id SERIAL PRIMARY KEY,
email VARCHAR(255) REFERENCES users(email),
quantity INTEGER
);

INSERT INTO userCredits (email) VALUES ('johnsmith@example.com');

CREATE TABLE products (
id SERIAL PRIMARY KEY,
name VARCHAR(255) UNIQUE NOT NULL,
price NUMERIC,
description TEXT,
quantity INTEGER
);

INSERT INTO products (name, price, description, quantity) VALUES ('15credits', 15, 'User will get 15 credits', 15);

INSERT INTO products (name, price, description, quantity) VALUES ('30credits', 25, 'User will get 30 credits', 30);

CREATE TABLE transactions (
id SERIAL PRIMARY KEY,
email VARCHAR(255) REFERENCES users(email),
productName VARCHAR(255) REFERENCES products(name),
date TIMESTAMP
);

CREATE TABLE usedDiscounts (
id SERIAL PRIMARY KEY,
email VARCHAR(255) REFERENCES users(email),
discount_code TEXT
);

CREATE TABLE createdVideoHistory (
id SERIAL PRIMARY KEY,
email VARCHAR(255) REFERENCES users(email),
dirName VARCHAR(40),
sentOnMail BOOLEAN
);
