import dotenv from "dotenv";
dotenv.config();

const GHL_BASE_URL = "https://services.leadconnectorhq.com";
const locationId = process.env.GHL_DEVELOP_LOCATION_ID;
const pitToken = process.env.GHL_DEVELOP_PIT_ID;

if (!locationId || !pitToken) {
  console.error("Missing GHL credentials!");
  console.error("GHL_DEVELOP_LOCATION_ID:", locationId ? "✓" : "✗");
  console.error("GHL_DEVELOP_PIT_ID:", pitToken ? "✓" : "✗");
  process.exit(1);
}

async function ghlRequest(method: string, endpoint: string, body?: any) {
  const url = `${GHL_BASE_URL}${endpoint}`;
  console.log(`\n[${method}] ${url}`);
  
  const options: RequestInit = {
    method,
    headers: {
      "Authorization": `Bearer ${pitToken}`,
      "Content-Type": "application/json",
      "Version": "2021-07-28",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
    console.log("Body:", JSON.stringify(body, null, 2));
  }

  const response = await fetch(url, options);
  const data = await response.json();
  
  console.log("Status:", response.status);
  console.log("Response:", JSON.stringify(data, null, 2));
  
  return { status: response.status, data };
}

async function testContactLookup(email: string) {
  console.log("\n========== TEST: Contact Lookup ==========");
  const result = await ghlRequest(
    "GET",
    `/contacts/?locationId=${locationId}&query=${encodeURIComponent(email)}`
  );
  return result;
}

async function testContactCreation(email: string, firstName: string, lastName: string, utmParams?: any) {
  console.log("\n========== TEST: Contact Creation ==========");
  const payload: any = {
    locationId,
    email,
    firstName,
    lastName,
  };

  if (utmParams) {
    payload.customFields = [
      { key: "utm_source", value: utmParams.utm_source || "" },
      { key: "utm_medium", value: utmParams.utm_medium || "" },
      { key: "utm_campaign", value: utmParams.utm_campaign || "" },
    ];
    payload.tags = ["Ateam-GPT"];
  }

  const result = await ghlRequest("POST", "/contacts/", payload);
  return result;
}

async function testContactUpdate(contactId: string, updates: any) {
  console.log("\n========== TEST: Contact Update ==========");
  const result = await ghlRequest("PUT", `/contacts/${contactId}`, updates);
  return result;
}

async function testEmailSending(contactId: string, email: string, subject: string, htmlContent: string) {
  console.log("\n========== TEST: Email Sending ==========");
  const payload = {
    type: "Email",
    locationId,
    contactId,
    emailFrom: "greg@mail.develop-coaching.com",
    emailTo: email,
    subject,
    html: htmlContent,
  };

  const result = await ghlRequest("POST", "/conversations/messages", payload);
  return result;
}

async function testSMSSending(contactId: string, phone: string, message: string) {
  console.log("\n========== TEST: SMS Sending ==========");
  const payload = {
    type: "SMS",
    locationId,
    contactId,
    phone,
    message,
  };

  const result = await ghlRequest("POST", "/conversations/messages", payload);
  return result;
}

async function runTests() {
  console.log("\n🔧 GHL API Integration Tests");
  console.log("==============================");
  console.log("Location ID:", locationId);
  console.log("PIT Token:", pitToken?.substring(0, 20) + "...");

  const testEmail = "abhipaddy8@gmail.com";
  const testFirstName = "Abhi";
  const testLastName = "Paddy";
  const testUTM = {
    utm_source: "test-source",
    utm_medium: "test-medium",
    utm_campaign: "test-campaign",
  };

  try {
    // Test 1: Lookup contact
    const lookupResult = await testContactLookup(testEmail);
    let contactId: string | null = null;

    if (lookupResult.data?.contacts?.length > 0) {
      contactId = lookupResult.data.contacts[0].id;
      console.log("\n✓ Contact found:", contactId);
    } else {
      console.log("\n✗ Contact not found, creating new...");
      
      // Test 2: Create contact
      const createResult = await testContactCreation(testEmail, testFirstName, testLastName, testUTM);
      
      if (createResult.status === 200 || createResult.status === 201) {
        contactId = createResult.data?.contact?.id;
        console.log("\n✓ Contact created:", contactId);
      } else {
        console.error("\n✗ Failed to create contact");
        return;
      }
    }

    if (!contactId) {
      console.error("\n✗ No contact ID available");
      return;
    }

    // Test 3: Update contact with UTM
    await testContactUpdate(contactId, {
      customFields: [
        { key: "utm_source", value: "updated-source" },
        { key: "utm_medium", value: "updated-medium" },
        { key: "pipeline_score", value: "75" },
      ],
    });

    // Test 4: Send test email
    await testEmailSending(
      contactId,
      testEmail,
      "Test Email from A-Team Trades Pipeline",
      "<h1>Test Email</h1><p>This is a test email from the GHL integration.</p>"
    );

    // Test 5: Send test SMS
    console.log("\n\n========== TEST: SMS Sending ==========");
    console.log("Note: Contact must have a valid phone number in GHL");
    await testSMSSending(
      contactId,
      "+919591205303",
      "Test SMS from A-Team Trades Pipeline™: Your Quick Win Pack is ready!"
    );

    // Test 6: Create NEW contact
    console.log("\n\n========== TEST: New Contact Creation ==========");
    const newEmail = `test-${Date.now()}@example.com`;
    const newContactResult = await testContactCreation(
      newEmail,
      "Test",
      "User",
      {
        utm_source: "facebook",
        utm_medium: "cpc",
        utm_campaign: "trades-diagnostic-2025",
      }
    );
    console.log("\n✓ New contact created for:", newEmail);

    console.log("\n\n✅ All tests completed!");
    console.log("\nNext steps:");
    console.log("1. Check GHL CRM for contact:", testEmail);
    console.log("2. Check email inbox for test message");
    console.log("3. Verify UTM parameters in GHL custom fields");

  } catch (error) {
    console.error("\n❌ Test failed:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Stack:", error.stack);
    }
  }
}

runTests();
