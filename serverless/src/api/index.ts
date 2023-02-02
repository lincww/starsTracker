import { Env } from "..";

const router = async (request: Request, env: Env): Promise<Response> => {
    const KV = env.starsTrackerKV
    const { pathname } = new URL(request.url)
    const userInfo = await KV.get("userInfo","json")
    // routes
    if (pathname.startsWith('/api/'))
    return new Response("test");
}

export {
    router
}