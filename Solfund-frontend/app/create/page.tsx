"use client"

import type React from "react"
import { Navigation } from "@/components/layout/navigation"
import { Footer } from "@/components/layout/footer"
import { useState } from "react"
import { Calendar, Target, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useProgram } from "@/lib/hooks"
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import * as anchor from "@coral-xyz/anchor";
import { supabase } from "@/lib/supabase"
import { useWallet } from "@solana/wallet-adapter-react"


const categories = [
  "Technology",
  "Social Impact",
  "Environment",
  "Education",
  "Arts",
  "Health",
  "Gaming",
  "DeFi",
  "NFT",
  "Other",
]

export default function CreateCampaign() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    longDescription: "",
    category: "",
    goal: 0,
    deadline: "",
    creatorName: "",
    creatorBio: "",
    walletAddress: "",
  });
  const program = useProgram();
  const wallet = useWallet();
  function validateStep(formData: any, step: number): string | null {
    switch (step) {
      case 1:
        if (!formData.title.trim()) return "Title is required";
        if (!formData.shortDescription.trim()) return "Short description is required";
        break;

      case 2:
        if (!formData.longDescription.trim()) return "Long description is required";
        if (!formData.category.trim()) return "Category is required";
        break;

      case 3:
        const goalNum = Number(formData.goal);

        if (!Number.isFinite(goalNum)) {
          return "Goal must be a valid number";
        }
        if (goalNum % 1 !== 0) {
          return "Goal amount must be a whole number (no decimals)";
        }
        if (goalNum < 1) {
          return "Goal must be at least 1 SOL";
        }

        const deadlineTs = new Date(formData.deadline).getTime();
        if (isNaN(deadlineTs) || deadlineTs <= Date.now())
          return "Deadline must be a valid date in the future";
        break;

      case 4:
        if (!formData.creatorName.trim()) return "Creator name is required";
        if (!formData.creatorBio.trim()) return "Creator bio is required";
        if (!formData.walletAddress.trim()) return "Wallet address is required";
        if (!formData.image) return "Project image is required";
        break;

      default:
        return null;
    }
    return null;
  }

  async function createCampaign() {
    if (!program || !wallet.publicKey) {
      console.error("❌ Program Not Found or wallet is missing");
      return;
    }

    // const deadlineTimestamp = Math.floor(new Date(formData.deadline).getTime() / 1000);
    const deadlineTimestamp = Math.floor(Date.now() / 1000) + 100;

    const provider = program.provider as any;

    const [campaignPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("campaign"), provider.wallet.publicKey.toBuffer()],
      program.programId
    );

    const { data: existing, error: fetchError } = await supabase
      .from("campaigns")
      .select("id")
      .eq("creator", wallet.publicKey.toBase58())
      .maybeSingle();

    if (fetchError) {
      console.error("Supabase fetch error:", fetchError);
      alert("Something went wrong while checking existing campaigns.");
      return;
    }

    if (existing) {
      alert("⚠️ Campaign with this wallet already exists. Please use another wallet.");
      return;
    }

    try {
      await program.methods
        .createCampaign(new anchor.BN(formData.goal * LAMPORTS_PER_SOL), new anchor.BN(deadlineTimestamp))
        .accounts({
          creator: provider.wallet.publicKey,
          campaign: campaignPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const { data, error: dbError } = await supabase
        .from("campaigns")
        .insert({
          pda: campaignPda.toBase58(),
          creator: provider.wallet.publicKey.toBase58(),
          title: formData.title,
          short_description: formData.shortDescription,
          long_description: formData.longDescription,
          category: formData.category,
          goal: formData.goal,
          deadline: deadlineTimestamp,
          creatorname: formData.creatorName,
          creatorbio: formData.creatorBio,
          receiver: formData.walletAddress,
        })
        .select();

      if (dbError) {
        console.log("Supabase error:", dbError);
        alert("Failed to save campaign to database");
      } else {
        console.log("✅ Campaign saved to Supabase:", data);
      }
    } catch (err) {
      console.error("Transaction failed:", err);
      alert("Failed to create campaign. Check console for details.");
    }
  }



  const totalSteps = 4

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    const error = validateStep(formData, currentStep);
    if (error) {
      alert(error);
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };


  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">
                Campaign Title *
              </Label>
              <Input
                id="title"
                placeholder="Enter a compelling title for your campaign"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription" className="text-foreground">
                Short Description *
              </Label>
              <Textarea
                id="shortDescription"
                placeholder="Brief description that will appear on campaign cards (max 150 characters)"
                value={formData.shortDescription}
                onChange={(e) => handleInputChange("shortDescription", e.target.value)}
                className="bg-input border-border resize-none"
                rows={3}
                maxLength={150}
              />
              <div className="text-xs text-muted-foreground text-right">{formData.shortDescription.length}/150</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="longDescription" className="text-foreground">
                Detailed Description *
              </Label>
              <Textarea
                id="longDescription"
                placeholder="Provide a detailed explanation of your campaign, goals, and how funds will be used"
                value={formData.longDescription}
                onChange={(e) => handleInputChange("longDescription", e.target.value)}
                className="bg-input border-border resize-none"
                rows={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-foreground">
                Category *
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="goal" className="text-foreground flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Funding Goal (SOL) *
                </Label>
                <Input
                  id="goal"
                  type="number"
                  placeholder="0.00"
                  value={formData.goal}
                  onChange={(e) => handleInputChange("goal", e.target.value)}
                  className="bg-input border-border"
                  min="1"
                  step="0.1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline" className="text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Campaign Deadline *
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleInputChange("deadline", e.target.value)}
                  className="bg-input border-border"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                If your campaign doesn't reach its funding goal by the deadline, all contributions will be automatically
                refunded to donors through smart contracts.
              </AlertDescription>
            </Alert>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="creatorName" className="text-foreground">
                Your Name/Organization *
              </Label>
              <Input
                id="creatorName"
                placeholder="Enter your name or organization name"
                value={formData.creatorName}
                onChange={(e) => handleInputChange("creatorName", e.target.value)}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="creatorBio" className="text-foreground">
                Bio/About You *
              </Label>
              <Textarea
                id="creatorBio"
                placeholder="Tell potential backers about yourself and your experience"
                value={formData.creatorBio}
                onChange={(e) => handleInputChange("creatorBio", e.target.value)}
                className="bg-input border-border resize-none"
                rows={4}
              />
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                If the campaign is able to reach the goal before the deadline then only the wallet you use to create campaign will be able to withdraw funds .
              </AlertDescription>
            </Alert>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Campaign Preview</CardTitle>
                <CardDescription>Review your campaign details before publishing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Title</Label>
                    <p className="text-card-foreground">{formData.title || "Not set"}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Category</Label>
                    <p className="text-card-foreground">{formData.category || "Not set"}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Goal</Label>
                    <p className="text-card-foreground">{formData.goal ? `${formData.goal} SOL` : "Not set"}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Deadline</Label>
                    <p className="text-card-foreground">{formData.deadline || "Not set"}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Creator</Label>
                    <p className="text-card-foreground">{formData.creatorName || "Not set"}</p>
                  </div>
                </div>

                {formData.shortDescription && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Short Description</Label>
                    <p className="text-card-foreground text-sm">{formData.shortDescription}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Component */}
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-foreground">Create Campaign</h1>
              <Badge variant="outline">{Math.round((currentStep / totalSteps) * 100)}% Complete</Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Titles */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {currentStep === 1 && "Campaign Details"}
              {currentStep === 2 && "Funding & Rewards"}
              {currentStep === 3 && "Creator Information"}
              {currentStep === 4 && "Review & Publish"}
            </h2>
            <p className="text-muted-foreground">
              {currentStep === 1 && "Tell us about your campaign and what you're trying to achieve"}
              {currentStep === 2 && "Set your funding goal, deadline, and optional reward tiers"}
              {currentStep === 3 && "Provide information about yourself as the campaign creator"}
              {currentStep === 4 && "Review everything and publish your campaign"}
            </p>
          </div>

          {/* Form Content */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">{renderStepContent()}</CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
              Previous
            </Button>

            {currentStep < totalSteps ? (
              <Button onClick={nextStep} className="bg-primary hover:bg-primary/90">
                Next Step
              </Button>
            ) : (
              <Button onClick={() => createCampaign()} className="bg-primary hover:bg-primary/90">
                Publish Campaign
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Footer Component */}
      <Footer />
    </div>
  )
}
