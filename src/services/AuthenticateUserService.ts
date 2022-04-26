import axios from "axios";
import prismaClient from "../prisma";
import { sign } from "jsonwebtoken"

/*
receber código(string)
recuperar o acess_token no github


*/

interface IAccessTokenResponse {
   acces_token: string
}

interface IUserResponse{
   avatar_url: string,
   login: string,
   id: number,
   name: string,
}


class AuthenticateUserService{
   async execute(code:string) {
      const url = "https://github.com/login/oauth/acces_token";

      const { data: accesTokenResponse } = await axios.post<IAccessTokenResponse>(url, null, {
         params:{
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
         },
         headers:{
            "Accept": "application/json"
         },
      });


      const response = await axios.get<IUserResponse>("https://api.github.com/user",{
         headers: {
            authorization: `Bearer ${accesTokenResponse.acces_token}`
         },
      });

      const { login, id, avatar_url, name } = response.data

      let user = await prismaClient.user.findFirst({
         where:{
            github_id : id
         }
      })
      if(!user){
         user = await prismaClient.user.create({
            data:{
               github_id:id,
               login,
               avatar_url,
               name
            }
         })
      }

      return response.data;
       
   }
}

export { AuthenticateUserService }