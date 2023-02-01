import {Env} from ".."
import {User, Star, rawJsonDataFromGithub} from "../types";

const trigger = async (env: Env): Promise<void> => {
  const KV = env.starsTrackerKV
  const userInfos = await KV.get<Array<User>>("userInfo", "json")
  if (!userInfos) return
  for (const user of userInfos) {
    const latestStars = await KV.get<Array<Star>>(`latestStars:${user.name}`, "json")
    const headers = {
      Accept: "application/vnd.github+json",
      // Authorization: `Bearer ${user.token}`,
      Authorization: `Bearer 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`,
      "X-GitHub-Api-Version": "2022-11-28",
    }
    let page = 1
    let is_end = false
    let stars:rawJsonDataFromGithub[] = []
    while (!is_end) {
      const resp = await fetch(`https://api.github.com/user/starred?per_page=100&page=${page}`, {headers})
      const data: [] = await resp.json()
      stars.push(...data)
      if (data.length < 100) is_end = true
    }
    let newStars:Star[] = stars.map((data):Star=>{return {
      starredAt: data.starred_at,
      name: data.repo.name,
      fullName: data.repo.full_name,
      description: data.repo.description,
      counts: {
        openIssues: data.repo.open_issues_count
      }

    }})
    // Diff

  }
}

  export {
  trigger
}