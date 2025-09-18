"use client";

import { signIn, useSession } from "next-auth/react"
import { SecondaryButton } from "./Button"
import { useRouter } from "next/navigation";

export const Hero = () => {
    const session = useSession();
    const router = useRouter();

    return <div>
        <div className="text-6xl font-medium">
            <span>
            India’s Gateway to
            </span>  
            <span className="text-blue-500 pl-4"> 
                Digital Currency
            </span>
        </div>
        <div className="flex justify-center pt-4 text-2xl text-slate-500">
            Create a wallet in moments using your Google Account.
        </div>
        <div className="flex justify-center pt-2 text-2xl text-slate-500">
            Convert INR to crypto with zero friction.
        </div>
        <div className="pt-8 flex justify-center">
            {session.data?.user ? <SecondaryButton onClick={() => {
                router.push("/dashboard");
            }}>Go to Dashboard</SecondaryButton> : <SecondaryButton onClick={() => {
                signIn("google");
            }}>Login with Google</SecondaryButton>}
        </div>
    </div>
}

 

