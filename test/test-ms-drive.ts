import { OneDriveService } from "../src/services/OneDriveService";

async function testGetDrives() {
  const service = new OneDriveService();

  try {
    console.log("🚀 Starting drive discovery test...\n");

    // Get all drives
    console.log("Fetching all drives...");
    const drivesResponse = await service.getAllDrives();

    if (drivesResponse.value.length === 0) {
      console.log("❌ No drives found");
      return;
    }

    // Display information about all drives
    console.log("\n📁 Available Drives:");
    console.log("==================");

    for (const drive of drivesResponse.value) {
      console.log(`\nDrive ID: ${drive.id}`);
      console.log(`Type: ${drive.driveType}`);
      if (drive.name) console.log(`Name: ${drive.name}`);
      if (drive.owner?.user?.displayName) {
        console.log(`Owner: ${drive.owner.user.displayName}`);
      }

      // Get additional details for each drive
      try {
        const driveDetails = await service.getDriveDetails(drive.id);
        console.log(
          "Additional Details:",
          JSON.stringify(driveDetails, null, 2)
        );
      } catch (error) {
        console.log(`Could not fetch additional details: ${error.message}`);
      }

      console.log("------------------");
    }

    console.log("\n✅ Drive discovery completed!");
    console.log("\n📝 Instructions:");
    console.log("1. Copy the appropriate Drive ID from above");
    console.log("2. Add it to your .env file as MICROSOFT_DRIVE_ID");
    console.log("3. Example: MICROSOFT_DRIVE_ID=b!xxx...");
  } catch (error) {
    console.error("\n❌ Test failed:");
    console.error(error instanceof Error ? error.message : error);
  }
}

// Run test
testGetDrives();
