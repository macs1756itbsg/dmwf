

import axios from "axios";
const FILE = './users/index.json';
import fs from 'fs';

const readUsers = () => {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
};

const addNewUsers = (newUsers) => {
  const existing = readUsers();


  const map = new Map();

  existing.forEach(u => map.set(u.id, u));
  newUsers.forEach(u => map.set(u.id, u));

  const all = Array.from(map.values());

  fs.writeFileSync(FILE, JSON.stringify(all, null, 2));

  console.log(`Saved ${newUsers.length} new users. Total: ${all.length}`);
};


async function scrapeAllUsers() {
  let page = 1;
  const limit = 30;
  let allUsers = [];

  while (true) {
    const url = `https://eventmobi.com/dmwfeu25/uapi/attendee/events/59441/people/?section_id=2a9bac89-61a6-4e72-aae6-cb4d738ec9bc&sort=last_name,first_name&search=&search_type=name&include=profile_image,public_preferences&limit=${limit}&page=${page}`;

    const res = await axios.get(url, {
      headers: {
        //  ":authority": "eventmobi.com",
        "accept": "application/vnd.eventmobi+json; version=p.9",
        "accept-language": "uk-UA,uk;q=0.9",
        "accept-encoding": "gzip, deflate, br",
        "sec-fetch-site": "same-origin",
        "sec-fetch-mode": "cors",
        "sec-fetch-dest": "empty",
        "x-request-origin": "eventapp",
        "user-agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_7_12 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 capacitor-v7",
        "referer": "https://eventmobi.com/dmwfeu25/people/2a9bac89-61a6-4e72-aae6-cb4d738ec9bc",
        "cookie": "em-login=PyV_vDFKrqy1A7JD73NEPvq9vaC6t-03NPccM0ySrcqID29AO5aeLOwfx8Pm0tUL"
      }
    });



    const peoples = res?.data?.data || [];

    if (peoples.length === 0) {
      console.log("No more people → scraping completed.");
      break;
    }

    //   event_id: 59441,

    console.log(`Page ${page}: received ${peoples.length} users`);
    allUsers = allUsers.concat(peoples);

    const cleanedPeoples = peoples.map(people => {
      return {
        id: people?.id,
        title: people?.title,
        first_name: people?.first_name,
        last_name: people?.last_name,
        linkedin: people?.social_links?.linkedin,
        company: people?.company_name,
        website: people?.website,
        chatEnabled: people?.public_preferences?.chat_enabled
      }
    })


    await addNewUsers(cleanedPeoples)

    await new Promise(resolve => {
      setTimeout(() => {
        resolve('')
      }, 10.000)
    })

    page++;
  }

  return allUsers;
}

scrapeAllUsers().then(users => {
  console.log("Total users:", users.length);
});
