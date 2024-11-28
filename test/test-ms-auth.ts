import { OneDriveService } from "../src/services/OneDriveService";

async function testTokenFlow() {
  const service = new OneDriveService();

  try {
    console.log("🚀 Starting token flow test...\n");

    // Check initial token status
    console.log("Initial token status:");
    console.log(service.getTokenStatus());

    // Get first token
    console.log("\nGetting first token...");
    await service.refreshTokenIfNeeded();

    // Check status after getting token
    console.log("\nToken status after first acquisition:");
    console.log(service.getTokenStatus());

    // Try to refresh token
    console.log("\nTesting token refresh...");
    await service.refreshTokenIfNeeded();

    // Check final status
    console.log("\nFinal token status:");
    console.log(service.getTokenStatus());
  } catch (error) {
    console.error("\n❌ Test failed:");
    console.error(error);
  }
}

testTokenFlow();
