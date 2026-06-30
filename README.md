# Lab2_Reestr — Token-Gated Poster

Децентрализованное приложение (dApp) на блокчейне Polygon. Пользователи могут публиковать посты только при наличии достаточного количества токенов `CRINGE` (ERC-20). Смарт-контракты развёрнуты в сети Polygon PoS.

## Архитектура

```
Lab2_Reestr/
├── token-gated-poster/   # Смарт-контракты (Truffle + Solidity)
│   ├── contracts/
│   │   ├── Token.sol     # ERC-20 токен CRINGE
│   │   ├── Poster.sol    # Контракт постинга с token-gate
│   │   └── SimpleStorage.sol
│   ├── migrations/
│   ├── test/
│   └── truffle-config.js
└── token-gated-ui/       # Фронтенд (Next.js + Web3.js)
    ├── pages/
    │   └── index.js      # Главная страница dApp
    └── styles/
```

## Функциональность

- Подключение MetaMask-кошелька
- Просмотр баланса токенов CRINGE
- Публикация поста (текст + тег) при достаточном балансе токенов
- Перевод токенов другому адресу
- Минт токенов (только для владельца контракта)
- Отображение истории постов через события `NewPost`
- Добавление токена CRINGE в MetaMask

## Смарт-контракты (Polygon PoS)

| Контракт | Адрес |
|---|---|
| Poster | `0x2E06D10F73F73bC29311b45CE114841c6971e700` |
| Token (CRINGE) | `0x8cC4820b9Ab9d1c9A0250b8eb3fd135E94FdCEE5` |

## Запуск фронтенда

```bash
cd token-gated-ui
npm install
npm run dev
```

Откройте `http://localhost:3000` в браузере с установленным MetaMask.

## Работа со смарт-контрактами

```bash
cd token-gated-poster
npm install

# Компиляция
npm run compile

# Деплой в Polygon testnet
npm run migrate --network=polygon_infura_testnet
```

Требуется `.env` файл с переменными `MNEMONIC` и `INFURA_PROJECT_ID`.

## Требования

- Node.js 16+
- MetaMask (браузерное расширение)
- Аккаунт Infura (для деплоя)
- Тестовые MATIC (для оплаты газа в testnet)
