/**
 * Marketing Integration Service for Klaviyo.
 * Implements high-fidelity server-side REST Fetch requests matching Klaviyo API v3.
 * Automatically falls back to full simulated telemetry logging when environment variables are omitted.
 */

const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
const KLAVIYO_LIST_ID = process.env.KLAVIYO_LIST_ID;
const KLAVIYO_API_REVISION = "2024-10-15"; // Modern Klaviyo API Version Lock

export interface CartItemTelemetry {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface TrackEventParams {
  email: string;
  eventName: "Started Checkout" | "Completed Purchase" | string;
  cartItems?: CartItemTelemetry[];
  totalValue?: number;
}

/**
 * Injects a lead profile immediately into a designated marketing subscriber list.
 * Translates variables into Klaviyo's "Profile Subscription Bulk Create Job" API.
 */
export async function syncEmailToMarketingList(email: string, name?: string): Promise<{ success: boolean; data?: any; error?: any }> {
  const cleanEmail = email.toLowerCase().trim();
  const firstName = name ? name.split(" ")[0] : "";
  const lastName = name && name.split(" ").length > 1 ? name.split(" ").slice(1).join(" ") : "";

  console.log(`[Marketing Service] Syncing profile to list [${KLAVIYO_LIST_ID || "MOCK_LIST"}]: ${cleanEmail}`);

  if (!KLAVIYO_API_KEY || !KLAVIYO_LIST_ID) {
    console.log(`[Marketing Service] [FALLBACK SIMULATION] Added lead to list:`, {
      email: cleanEmail,
      firstName,
      lastName,
      listId: KLAVIYO_LIST_ID || "simulated_klaviyo_default_list",
      timestamp: new Date().toISOString()
    });
    return { success: true, data: { simulated: true, listId: KLAVIYO_LIST_ID || "mock_list" } };
  }

  try {
    // Klaviyo v3 Subscribe Profiles to List API
    const response = await fetch("https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/", {
      method: "POST",
      headers: {
        "Authorization": `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        "revision": KLAVIYO_API_REVISION,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        data: {
          type: "profile-subscription-bulk-create-job",
          attributes: {
            custom_source: "Mobile checkout - Vistula Vogue",
            profiles: {
              data: [
                {
                  type: "profile",
                  attributes: {
                    email: cleanEmail,
                    first_name: firstName || undefined,
                    last_name: lastName || undefined,
                    subscriptions: {
                      email: {
                        marketing: {
                          consent: "SUBSCRIBED"
                        }
                      }
                    }
                  }
                }
              ]
            }
          },
          relationships: {
            list: {
              data: {
                type: "list",
                id: KLAVIYO_LIST_ID
              }
            }
          }
        }
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("[Marketing Service] Klaviyo API Subscription Error:", JSON.stringify(responseData));
      return { success: false, error: responseData };
    }

    console.log(`[Marketing Service] Profile subscription successfully submitted to Klaviyo API v3: ${cleanEmail}`);
    return { success: true, data: responseData };

  } catch (error: any) {
    console.error("[Marketing Service] Klaviyo API Connection Exception:", error);
    return { success: false, error: error.message || error };
  }
}

/**
 * Dispatches a behavioral telemetry record to Klaviyo.
 * Enables granular behavioral segmentation to drive recovery automation scripts (e.g. 1-hour cart recovery).
 */
export async function trackMarketingEvent({
  email,
  eventName,
  cartItems = [],
  totalValue = 0
}: TrackEventParams): Promise<{ success: boolean; data?: any; error?: any }> {
  const cleanEmail = email.toLowerCase().trim();
  console.log(`[Marketing Service] Dispatching event: "${eventName}" for ${cleanEmail} (Value: ${totalValue} PLN)`);

  if (!KLAVIYO_API_KEY) {
    console.log(`[Marketing Service] [FALLBACK SIMULATION] Telemetry event tracked:`, {
      eventName,
      profile: { email: cleanEmail },
      properties: {
        cartItemsCount: cartItems.length,
        cartItems,
        totalValue,
        currency: "PLN"
      },
      recoveryAutomationsTriggered: true,
      recoveryCycleInHours: 1,
      timestamp: new Date().toISOString()
    });
    return { success: true, data: { simulated: true, eventName, email: cleanEmail } };
  }

  try {
    // Klaviyo v3 Events API (POST https://a.klaviyo.com/api/events/)
    const response = await fetch("https://a.klaviyo.com/api/events/", {
      method: "POST",
      headers: {
        "Authorization": `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        "revision": KLAVIYO_API_REVISION,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        data: {
          type: "event",
          attributes: {
            properties: {
              $value: totalValue,
              currency: "PLN",
              ItemNames: cartItems.map(item => item.title),
              ItemsCount: cartItems.reduce((acc, item) => acc + item.quantity, 0),
              CartItems: cartItems.map(item => ({
                product_id: item.id,
                title: item.title,
                price: item.price,
                quantity: item.quantity,
                image_url: item.image || ""
              }))
            },
            metric: {
              data: {
                type: "metric",
                attributes: {
                  name: eventName
                }
              }
            },
            profile: {
              data: {
                type: "profile",
                attributes: {
                  email: cleanEmail
                }
              }
            }
          }
        }
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("[Marketing Service] Klaviyo API Telemetry Event Error:", JSON.stringify(responseData));
      return { success: false, error: responseData };
    }

    console.log(`[Marketing Service] Telemetry event "${eventName}" tracked in Klaviyo for ${cleanEmail}`);
    return { success: true, data: responseData };

  } catch (error: any) {
    console.error("[Marketing Service] Klaviyo Event Dispatch Exception:", error);
    return { success: false, error: error.message || error };
  }
}
