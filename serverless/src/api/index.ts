import {Env} from "..";
import {auth, loginAction} from "./routes/auth";
import {User} from "../types";
import {listAction} from "./routes/list";

const router = async (request: Request, env: Env): Promise<Response> => {
  const KV = env.starsTrackerKV
  const {pathname} = new URL(request.url)
  let userInfo = await KV.get<Array<User>>("userInfo", "json")
  const test = await KV.get("latestStars:lincw")
  if (userInfo === null) userInfo = []
  let resp: Response = new Response(JSON.stringify({status: 404}), {status: 404});
  // routes
  if (pathname === ('/api/login')) {
    resp = await loginAction(request, userInfo)
  } else if (pathname.startsWith('/api')) {
    const username = auth(request, userInfo)
    if (pathname === '/api/list') {
      resp = await listAction(request, username, KV)
    }
  }
  return resp
}

export {
  router
}