// @ts-ignore
import {parse} from "cookie"
import {User} from "../../types";

const login = async (req: Request, userInfo: User[]): Promise<String> => {
  type Credentials = {
    username: string,
    password: string
  }
  try {
    const credentials: Credentials = await req.json()
    let isAuth = userInfo.some(user => (user.name === credentials.username && user.authPass === credentials.password))
    if (isAuth) {
      return btoa(credentials.username) // TODO: Use RSA encrypt
    } else return "BadPassword"
  } catch (e) {
    if (e instanceof SyntaxError) {
      return "BadRequest"
    } else throw e
  }

}

const auth = (req: Request, userInfo: User[]): string => {
  const cookie = parse(req.headers.get('Cookie') || '');
  let isAuth: string = ""
  if (cookie['authKey'] != undefined) {
    const username = atob(cookie['authKey'])
    const user = userInfo.find(user => user.name === username)
    isAuth = user?.name ? user.name : ""
  }
  return isAuth
}

const loginAction = async (request: Request, userInfo: User[]): Promise<Response> => {
  const authKey = await login(request, userInfo)
  if (!authKey.startsWith("Bad")) {
    return new Response(JSON.stringify({status: 'ok'}), {
      headers: {
        "Set-Cookie": `authKey=${authKey}`
      }
    })
  } else return new Response(JSON.stringify({status: 'forbidden', msg: authKey}), {status: 401})
}

export {auth, loginAction}