const listAction = async (req: Request, username: string, KV: KVNamespace): Promise<Response> => {
  const latestStars = await KV.get(`latestStars:${username}`)
  const lists = await KV.list({prefix: `diff:${username}`})
  // TODO: As limitation is 1000, maybe it's better to change this by year
  let diffList = await Promise.all(lists?.keys.map(key=>KV.get(key.name, 'json')))
  const resultJson = {
    latestStars,
    diffList
  }
  return new Response(JSON.stringify(resultJson))
}

export {listAction}