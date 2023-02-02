import { Env } from ".."
import { User, Star, rawJsonDataFromGithub } from "../types";

const trigger = async (env: Env): Promise<void> => {
  const KV = env.starsTrackerKV
  const userInfos = await KV.get<Array<User>>("userInfo", "json")
  if (!userInfos) return
  for (const user of userInfos) {
    let oldStars = await KV.get<Array<Star>>(`latestStars:${user.name}`, "json")
    if (oldStars===null) oldStars = [];
    const headers = {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${user.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    }
    let page = 1
    let is_end = false
    let stars: rawJsonDataFromGithub[] = []
    while (!is_end) {
      const resp = await fetch(`https://api.github.com/user/starred?per_page=100&page=${page}`, { headers })
      if (!resp.ok) {
        console.error(resp)
        throw new Error("Error while getting stars")
      }
      const data: [] = await resp.json()
      stars.push(...data)
      if (data.length < 100) is_end = true
    }
    let newStars: Star[] = stars.map((data): Star => {
      return {
        starredAt: data.starred_at,
        name: data.repo.name,
        fullName: data.repo.full_name,
        description: data.repo.description,
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
    const newAdded = newStars.filter(newStar => !oldStars?.some(oldStar=>oldStar.fullName === newStar.fullName))
    const newDeleted = oldStars.filter(oldStar => !newStars.some(newStar=>newStar.fullName === oldStar.fullName))

    const date = (new Date())
    const UTCDateString = `${date.getUTCFullYear()}-${date.getUTCMonth}-${date.getUTCDate()}`
    await KV.put(`diff:${user.name}:${UTCDateString}`, JSON.stringify([newAdded, newDeleted]))
    await KV.put(`latestStars:${user.name}`, JSON.stringify(newStars))
    console.log(`Success get the diff for user: ${user.name}, having ${newAdded.length} added, ${newDeleted.length} deleted.`)
  }
}

export {
  trigger
}