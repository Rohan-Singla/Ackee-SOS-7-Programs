"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/layout/navigation"
import { Footer } from "@/components/layout/footer"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

type Campaign = {
    id: number
    pda: string
    title: string
    short_description: string
    goal: number
    deadline: number
    creator: string
    creatorName: string
    creatorBio: string
}

export default function CampaignDiscovery() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCampaigns = async () => {
            const { data, error } = await supabase.from("campaigns").select("*")
            if (error) {
                console.error("Error fetching campaigns:", error)
            } else {
                const now = Math.floor(Date.now() / 1000)

                const completed = (data || []).filter(
                    (c: any) => c.deadline <= now || c.raised >= c.goal
                )

                setCampaigns(completed)
            }
            setLoading(false)
        }
        fetchCampaigns()
    }, [])



    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <section className="py-12 px-4">
                <div className="container mx-auto text-center">
                    <h2 className="text-4xl font-bold text-foreground mb-4">Completed Campaigns</h2>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Discover completed campaigns , You can claim refund if you contributed but the goal wasn't met.
                    </p>
                </div>
            </section>

            <section className="py-8 px-4">
                <div className="container mx-auto">
                    <h3 className="text-2xl font-bold text-foreground mb-8">Active Campaigns</h3>

                    {loading ? (
                        <p className="text-muted-foreground">Loading campaigns...</p>
                    ) : campaigns.length === 0 ? (
                        <p className="text-muted-foreground">No campaigns found</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {campaigns.map((campaign) => {
                                const deadlineDaysLeft = Math.max(
                                    0,
                                    Math.ceil((campaign.deadline * 1000 - Date.now()) / (1000 * 60 * 60 * 24))
                                )

                                return (
                                    <Link href={`/campaign/${campaign.id}`} key={campaign.id}>
                                        <Card
                                            key={campaign.id}
                                            className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
                                        >
                                            <CardHeader>
                                                <CardTitle className="text-lg text-card-foreground">
                                                    {campaign.title}
                                                </CardTitle>
                                                <p className="text-sm text-muted-foreground">{campaign.short_description}</p>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Goal:</span>
                                                    <span className="text-card-foreground font-medium">{campaign.goal} SOL</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">{deadlineDaysLeft} days left</span>
                                                </div>
                                                <Button className="w-full bg-primary hover:bg-primary/90">
                                                    View Campaign
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    )
}
