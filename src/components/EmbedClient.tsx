"use client"
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { motion } from "motion/react"

function EmbedClient({ownerId}:{ownerId:string}) {
    const navigate = useRouter()
    const [copied,setCopied] = useState(false)
    const embedCode = `<script 
    src="${process.env.NEXT_PUBLIC_APP_URL}/chatBot.js"
    data-owner-id="${ownerId}">
</script>`

    const copyCode = () => {
        navigator.clipboard.writeText(embedCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

  return (
    <div className='min-h-screen bg-linear-to-br from-white via-blue-50 to-blue-100 text-slate-900'>
        <div className='sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-blue-100'>
            <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
            <div className='text-lg font-semibold cursor-pointer' onClick={()=>navigate.push('/')}>
                Support<span className='text-blue-600'>AI</span>
            </div>
            <button className='px-4 py-2 rounded-lg border border-blue-200 text-sm text-blue-700 hover:bg-blue-50 transition'
            onClick={()=>navigate.push("/dashboard")}>Back To Dashboard</button>
            </div>
        </div>
        <div className='flex justify-center px-4 py-14'>
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-blue-100 p-10'
        >
            <h1 className='text-2xl font-semibold mb-2'>
            Embed ChatBot
            </h1>
            <p>Copy and paste this code before <code>&lt;/body&gt;</code></p>
            <div className='relative bg-blue-950 text-blue-50 rounded-xl p-5 text-sm font-mono mb-10'>
                <pre className="overflow-x-auto">{embedCode}</pre>
            <button
                className='absolute top-3 right-3 bg-white text-blue-900 text-xs
                            font-medium px-3 py-1.5 rounded-lg
                            hover:bg-blue-50 transition'
                onClick={copyCode}
                >
                {copied ? "Copied ✓" : "Copy"}
            </button>

            </div>

            <ol className='space-y-3 text-sm text-slate-600 list-decimal list-inside'>
                <li>Copy the embed script</li>
                <li>Paste it before the closing body tag</li>
                <li>Reload your website</li>
            </ol>

            <div className='mt-14'>
                <h1 className='text-lg font-medium mb-2'>
                    Live Preview
                </h1>

                <p className='text-sm text-slate-500 mb-6'>
                    This is how the chatbot will appear on your website
                </p>

                <div className='rounded-xl border border-blue-100 bg-white shadow-md overflow-hidden'>
                    
                    <div className='flex items-center gap-2 px-4 h-9 bg-blue-50 border-b border-blue-100'>

                        <span className='w-2.5 h-2.5 rounded-full bg-red-400' />
                        <span className='w-2.5 h-2.5 rounded-full bg-yellow-400' />
                        <span className='w-2.5 h-2.5 rounded-full bg-green-400' />

                        <span className='ml-4 text-xs text-slate-500'>
                            Your-website.com
                        </span>

                    </div>
                    <div className='relative h-64 sm:h-72 p-6 text-slate-400 text-sm'>
                        Your website goes here
                        <div className='absolute bottom-24 right-6 w-64 bg-white rounded-xl shadow-xl border border-blue-100 overflow-hidden'>

                            <div className='bg-blue-600 text-white text-xs px-3 py-2 flex justify-between items-center'>
                                <span>Customer Support</span>
                                <span>✕</span>
                            </div>
                            <div className='p-3 space-y-2 bg-blue-50'>
                                <div className='bg-blue-100 text-blue-900 text-xs px-3 py-2 rounded-xl w-fit'>
                                    Hi! How can I help you?
                                </div>

                                <div className='bg-blue-600 text-white text-xs px-3 py-2 rounded-lg ml-auto w-fit'>
                                    What is the return policy?
                                </div>

                            </div>

                        </div>

                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            className="
                                absolute bottom-14 right-6
                                w-10 h-10 rounded-full
                                bg-blue-600 text-white
                                flex items-center justify-center
                                shadow-2xl
                                cursor-pointer"
                            >
                                🗨️
                            </motion.div> 

                    </div>

                </div>
             </div>

        </motion.div>
        </div>
    </div>
  )
}

export default EmbedClient
