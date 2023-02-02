// import axios, { AxiosError } from "axios";
import { Env } from ".."
import { User, Star, rawJsonDataFromGithub } from "../types";

const trigger = async (env: Env): Promise<void> => {
  const KV = env.starsTrackerKV
  const userInfos = await KV.get<Array<User>>("userInfo", "json")
  if (!userInfos) return
  for (const user of userInfos) {
    let oldStars = await KV.get<Array<Star>>(`latestStars:${user.name}`, "json")
    if (oldStars === null) oldStars = [];
    const headers = {
      Accept: "application/vnd.github.star+json",
      Authorization: `Bearer ${user.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "startsTracker v0.0.1"
    }
    let page = 1
    let isEnd = false
    let stars: rawJsonDataFromGithub[] = []
    while (!isEnd) {
      try {
        //   const { data } = await axios.get(`https://api.github.com/user/starred?per_page=100&page=${page}`, { headers })
        //   stars.push(...data)
        //   if (data.length < 100) is_end = true

        const resp = await fetch(`https://api.github.com/user/starred?per_page=100&page=${page}`, { headers })
        const data: [] = await resp.json()
        stars.push(...data)
        page += 1
        if (data.length < 100) isEnd = true
      } catch (e) {
        // if (axios.isAxiosError(e)) {
        //   console.log(e.toJSON())
        // } else {
        console.log(e)
        // }
        throw new Error("Getting raw data error")
      }
    }
    let newStars: Star[] = stars.map((data): Star => {
      return {
        starredAt: data.starred_at,
        name: data.repo.name,
        fullName: data.repo.full_name,
        description: data.repo.description,
        topics: data.repo.topics,
        language: data.repo.language,
        counts: {
          openIssues: data.repo.open_issues_count,
          subscribers: data.repo.subscribers_count,
          watchers: data.repo.watchers_count,
        },
        dates: {
          pushed: data.repo.pushed_at,
          created: data.repo.created_at,
          updated: data.repo.updated_at,
        },
        owner: {
          id: data.repo.owner.id,
          avatar_url: data.repo.owner.avatar_url,
        }
      }
    })
    // Diff
    const newAdded = newStars.filter(newStar => !oldStars?.some(oldStar => oldStar.fullName === newStar.fullName))
    const newDeleted = oldStars.filter(oldStar => !newStars.some(newStar => newStar.fullName === oldStar.fullName))

    const date = (new Date())
    const UTCDateString = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`
    const diffNow = await KV.get(`diff:${user.name}:${UTCDateString}`, "json")
    if (!diffNow) {
      if (newAdded.length + newDeleted.length > 0) {
        await KV.put(`diff:${user.name}:${UTCDateString}`,
          JSON.stringify([newAdded, newDeleted]),
          {metadata: [newAdded.length, newDeleted.length]}
        )
      }
      await KV.put(`latestStars:${user.name}`, JSON.stringify(newStars))
      console.log(`Success get the diff for user: ${user.name}, having ${newAdded.length} added, ${newDeleted.length} deleted.`)
    } else {
      console.log(`Maybe today already run the script?`, diffNow);
    }
  }
}

export {
  trigger
}