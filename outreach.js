const FILE = './users/index.json';
import fs from 'fs';
import axios from 'axios';

const FILE_SENDED = "./users/sended.json";

const readSended = () => {
  if (!fs.existsSync(FILE_SENDED)) return [];
  return JSON.parse(fs.readFileSync(FILE_SENDED, "utf8"));
};

const readUsers = () => {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
};

const sended = readSended()

const addToSended = (userId) => {
  sended.push(userId);
  fs.writeFileSync('./users/sended.json', JSON.stringify(sended, null, 2));
}

const users = readUsers()

async function createPrivateChat(recipientId) {
  const url = "https://eventmobi.com/dmwfeu25/uapi/events/59441/private-chat";

  const data = {
    sender_id: "d5928d0a-1629-4bc9-9106-cf7465faa40f",
    recipient_id: recipientId
  };

  const res = await axios.post(url, data, {
    headers: {
      "content-type": "application/json",
      "accept": "application/vnd.eventmobi+json; version=p.4",
      "x-request-origin": "eventapp",
      "accept-language": "uk-UA,uk;q=0.9",
      "accept-encoding": "gzip, deflate, br",
      "sec-fetch-site": "same-origin",
      "sec-fetch-mode": "cors",
      "sec-fetch-dest": "empty",
      "origin": "https://eventmobi.com",
      "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_7_12 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 capacitor-v7",
      "referer": `https://eventmobi.com/dmwfeu25/chat/${recipientId}/private`,
      "cookie": "em-login=PyV_vDFKrqy1A7JD73NEPvq9vaC6t-03NPccM0ySrcqID29AO5aeLOwfx8Pm0tUL"
    }
  });

  // console.log("Response:", res.data);
  return res.data;
}

async function createOrGetChannel(otherUserId) {
  const url = "https://chat.stream-io-api.com/channels";

  const params = {
    user_id: "d5928d0a-1629-4bc9-9106-cf7465faa40f",
    connection_id: "68d50c09-0a05-4c01-0200-0000043c093f",
    api_key: "nyhrxmzvw62y"
  };

  const data = {
    filter_conditions: {
      event_id: 59441,
      type: "messaging",
      members: {
        $eq: [
          "d5928d0a-1629-4bc9-9106-cf7465faa40f",
          otherUserId
        ]
      }
    },
    sort: [],
    state: true,
    watch: true,
    presence: true
  };

  const res = await axios.post(url, data, {
    params,
    headers: {
      "content-type": "application/json",
      "accept": "application/json, text/plain, */*",
      "authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZDU5MjhkMGEtMTYyOS00YmM5LTkxMDYtY2Y3NDY1ZmFhNDBmIiwiZXhwIjoxNzY2MjQzMTAyfQ.S_HaHWLrgIwF_FmmsaAg6J_7J6Lpg3hWo93W7EVnXEE",
      "stream-auth-type": "jwt",
      "x-stream-client": "stream-chat-javascript-client-browser-8.56.0",
      "origin": "https://eventmobi.com",
      "referer": "https://eventmobi.com/",
      "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_7_12 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 capacitor-v7"
    }
  });

  // console.log("Channel response:", res.data);
  return res.data;
}



async function sendMessageCore(userId) {



  await createPrivateChat(userId)
  const channel = await createOrGetChannel(userId);


  const channelId = channel?.channels[0]?.channel?.id

  const url = `https://chat.stream-io-api.com/channels/messaging/${channelId}/message`;

  const params = {
    user_id: "d5928d0a-1629-4bc9-9106-cf7465faa40f", //source
    connection_id: "68d50adc-0a05-1c7a-0200-0000043b3502",
    api_key: "nyhrxmzvw62y"
  };

  const data = {
    message: {
      event_id: 59441,
      text: `Hi,

I spoke with several Marketing Heads attending the event, and we all agreed on how crucial AI visibility has become. At Snoika, we help brands strengthen their presence and achieve marketing goals.

Let me know when we can have a quick call after the event. 

Best,
Adrine`,
      attachments: []
    }
  };

  const res = await axios.post(url, data, {
    params,
    headers: {
      "content-type": "application/json",
      "accept": "application/json, text/plain, */*",
      "authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZDU5MjhkMGEtMTYyOS00YmM5LTkxMDYtY2Y3NDY1ZmFhNDBmIiwiZXhwIjoxNzY2MjQzMTAyfQ.S_HaHWLrgIwF_FmmsaAg6J_7J6Lpg3hWo93W7EVnXEE",
      "sec-fetch-site": "cross-site",
      "stream-auth-type": "jwt",
      "x-stream-client": "stream-chat-javascript-client-browser-8.56.0",
      "accept-language": "uk-UA,uk;q=0.9",
      "accept-encoding": "gzip, deflate, br",
      "sec-fetch-mode": "cors",
      "origin": "https://eventmobi.com",
      "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_7_12 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 capacitor-v7",
      "referer": "https://eventmobi.com/",
      "x-client-request-id": "ce3443c2-4b4e-403c-932f-05f0f97c871d"
    }
  });

  // console.log("Response:", res.data);
}


const sendMessage = async (userId) => {
  try {



    await sendMessageCore(userId)

    addToSended(userId)

  } catch (error) {
    console.log(error);

  }
}

let count = 0


for (const user of users) {
  if (user.chatEnabled) {

    if (sended.includes(user.id)) {
      console.log(`to user with id ${user.id} already sended`);
      continue;
    }

    console.log('count', count);

    await sendMessage(user.id)

    await new Promise(resolve => {
      setTimeout(() => {
        resolve('')
      }, 20000)
    })

    count = count + 1

  }
}

