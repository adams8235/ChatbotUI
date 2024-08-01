import { Tables } from "@/supabase/types"
import { ContentType, DataListType } from "@/types"
import { FC, useContext, useState } from "react"
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"
import { SidebarCreateButtons } from "./sidebar-create-buttons"
import { SidebarDataList } from "./sidebar-data-list"
import { SidebarSearch } from "./sidebar-search"
import { ChatbotUIContext } from "@/context/context"

interface SidebarContentProps {
  contentType: ContentType
  data: DataListType
  folders: Tables<"folders">[]
}

export const SidebarContent: FC<SidebarContentProps> = ({
  contentType,
  data,
  folders
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const { profile } = useContext(ChatbotUIContext)

  const filteredData: any = data.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    // Subtract 50px for the height of the workspace settings
    <div className="flex flex-col max-h-[calc(100%-50px)] grow">
      {contentType === "subscribe" ? (
        <>
          <p className="py-4 text-center">Subscribe</p>
          <div className="relative z-0">
            <PayPalScriptProvider
              options={{
                clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
                components: "buttons",
                intent: "subscription",
                currency: "USD",
                vault: true
              }}
            >
              <PayPalButtons
                createSubscription={async (data, actions) => {
                  return actions.subscription.create({
                    plan_id: process.env.NEXT_PUBLIC_PLAN_ID || "",
                    custom_id: profile!.id
                  })
                }}
                onApprove={async () => {
                  // setStatus("Processing")
                  // toast.loading(
                  //   "We're processing your plan upgrade. This will only take a moment..."
                  // )
                  // setTimeout(async () => {
                  //   const response = await fetch("/api/paypal/check", {
                  //     method: "POST",
                  //     headers: { "Content-Type": "application/json" }
                  //   })
                  //   const result = await response.json()
                  //   if (result.status) {
                  //     // @ts-ignore
                  //     setProfile({ ...profile, pro: true })
                  //     toast.success(
                  //       "Success! Your plan has been upgraded. Enjoy access to all AI models!"
                  //     )
                  //     return
                  //   } else {
                  //     setStatus("PRO")
                  //     toast.warning("Failed to upgrade, Try again later")
                  //   }
                  // }, 30000)
                }}
                style={{
                  label: "subscribe",
                  layout: "horizontal",
                  tagline: false,
                  color: "gold"
                }}
              />
            </PayPalScriptProvider>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center mt-2">
            <SidebarCreateButtons
              contentType={contentType}
              hasData={data.length > 0}
            />
          </div>

          <div className="mt-2">
            <SidebarSearch
              contentType={contentType}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>

          <SidebarDataList
            contentType={contentType}
            data={filteredData}
            folders={folders}
          />
        </>
      )}
    </div>
  )
}
