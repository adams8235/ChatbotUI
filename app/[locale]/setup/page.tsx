"use client"

import { ChatbotUIContext } from "@/context/context"
import { getProfileByUserId, updateProfile } from "@/db/profile"
import {
  getHomeWorkspaceByUserId,
  getWorkspacesByUserId
} from "@/db/workspaces"
import {
  fetchHostedModels,
  fetchOpenRouterModels
} from "@/lib/models/fetch-models"
import { supabase } from "@/lib/supabase/browser-client"
import { TablesUpdate } from "@/supabase/types"
import { useRouter } from "next/navigation"
import { useContext, useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LimitDisplay } from "@/components/ui/limit-display"
import { StepContainer } from "../../../components/setup/step-container"
import { PROFILE_DISPLAY_NAME_MAX } from "@/db/limits"

export default function SetupPage({ params }: { params: { locale: string } }) {
  const {
    profile,
    setProfile,
    setWorkspaces,
    setSelectedWorkspace,
    setEnvKeyMap,
    setAvailableHostedModels,
    setAvailableOpenRouterModels
  } = useContext(ChatbotUIContext)

  const router = useRouter()

  const [loading, setLoading] = useState(true)

  // Profile Step
  const [displayName, setDisplayName] = useState("")

  useEffect(() => {
    ;(async () => {
      const session = (await supabase.auth.getSession()).data.session

      if (!session) {
        return router.push(`/${params.locale}/login`)
      } else {
        const user = session.user

        const profile = await getProfileByUserId(user.id)
        setProfile(profile)

        if (!profile.has_onboarded) {
          setLoading(false)
        } else {
          const data = await fetchHostedModels(profile)

          if (!data) return

          setEnvKeyMap(data.envKeyMap)
          setAvailableHostedModels(data.hostedModels)

          if (profile["openrouter_api_key"] || data.envKeyMap["openrouter"]) {
            const openRouterModels = await fetchOpenRouterModels()
            if (!openRouterModels) return
            setAvailableOpenRouterModels(openRouterModels)
          }

          const homeWorkspaceId = await getHomeWorkspaceByUserId(
            session.user.id
          )
          return router.push(`/${params.locale}/${homeWorkspaceId}/chat`)
        }
      }
    })()
  }, [])

  const handleSaveSetupSetting = async () => {
    const session = (await supabase.auth.getSession()).data.session
    if (!session) {
      return router.push(`/${params.locale}/login`)
    }

    const user = session.user
    const profile = await getProfileByUserId(user.id)

    const updateProfilePayload: TablesUpdate<"profiles"> = {
      ...profile,
      has_onboarded: true,
      display_name: displayName
    }

    const updatedProfile = await updateProfile(profile.id, updateProfilePayload)
    setProfile(updatedProfile)

    const workspaces = await getWorkspacesByUserId(profile.user_id)
    const homeWorkspace = workspaces.find(w => w.is_home)

    // There will always be a home workspace
    setSelectedWorkspace(homeWorkspace!)
    setWorkspaces(workspaces)

    return router.push(`/${params.locale}/${homeWorkspace?.id}/chat`)
  }

  if (loading) {
    return null
  }

  return (
    <div className="flex justify-center items-center h-full">
      <StepContainer
        stepDescription="Let's create your profile."
        stepTitle="Welcome to Chatbot UI"
        onShouldProceed={handleSaveSetupSetting}
      >
        <div className="space-y-1">
          <Label>Chat Display Name</Label>

          <Input
            placeholder="Your Name"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            maxLength={PROFILE_DISPLAY_NAME_MAX}
          />

          <LimitDisplay
            used={displayName.length}
            limit={PROFILE_DISPLAY_NAME_MAX}
          />
        </div>
      </StepContainer>
    </div>
  )
}
