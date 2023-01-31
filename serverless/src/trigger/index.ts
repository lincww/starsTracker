import {Env} from ".."
import {User} from "../types";

const trigger = async (env: Env): Promise<void> => {
  const KV = env.starsTrackerKV
  const userInfos = await KV.get<Array<User>>("userInfo", "json")
  if (!userInfos) return
  for (const user of userInfos) {
    const lastStars = KV.get(`${f}`)
    const headers = {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${user.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    }
    let page = 1
    let is_end = false
    let stars = []
    while (!is_end) {
      const resp = await fetch(`https://api.github.com/user/starred?per_page=100&page=${page}`, {headers})
      const data = resp.json
      stars.push(data)
      if (data.length !== 100) is_end = true
    }
  }
}

  export {
  trigger
}