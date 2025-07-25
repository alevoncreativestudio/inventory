#!/usr/bin/env node

/**
 * Script to create initial admin user for the Next.js Admin Dashboard
 * Usage: pnpm run create-admin
 */

import { auth } from "../src/lib/auth";

interface AdminUserArgs {
  name?: string;
  email?: string;
  password?: string;
}

async function createAdminUser(customData: AdminUserArgs = {}) {
  
  const branch = "main";
  try {
    console.log("🚀 Creating initial admin user...\n");

    // Default admin user data with custom overrides
    const adminData = {
      name: customData.name || "Admin User",
      email: customData.email || "admin@example.local",
      password: customData.password || "password",
      role: "admin" as const,
      branch,
    };

    console.log("📝 Creating admin user with the following details:");
    console.log(`   Name: ${adminData.name}`);
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Role: ${adminData.role}`);
    console.log(`   Password: ${"*".repeat(adminData.password.length)}`);
    console.log("");

    // Create the admin user using Better Auth API
    const { user } = await auth.api.createUser({
      body: {
        name: adminData.name,
        email: adminData.email,
        password: adminData.password,
        role: adminData.role,
        data: { branch },
      },
    });

    if (!user) {
      throw new Error("Failed to create user - Better Auth returned no user");
    }

    console.log("✅ Admin user created successfully!");
    console.log("\n📋 Admin User Details:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Email Verified: ${user.emailVerified}`);

    console.log("\n🔐 Login Credentials:");
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${adminData.password}`);

    console.log("\n🌐 Next Steps:");
    console.log("1. Start your development server: pnpm dev");
    console.log("2. Navigate to: http://localhost:3000/login");
    console.log("3. Login with the credentials above");
    console.log("4. Consider changing the password after first login");
  } catch (error: any) {
    console.error("❌ Error creating admin user:", error.message);

    if (
      error.message?.includes("Unique constraint") ||
      error.message?.includes("duplicate")
    ) {
      console.log(
        "\n� ThisC error usually means a user with this email already exists.",
      );
      console.log("   Try using a different email address.");
      console.log(
        '   Example: pnpm run create-admin --email "admin2@example.com"',
      );
    }

    if (error.message?.includes("CLUSTER_URL")) {
      console.log("\n💡 Database connection error. Make sure:");
      console.log("   1. Your .env file contains a valid CLUSTER_URL");
      console.log("   2. Your MongoDB database is accessible");
      console.log(
        "   3. Run: pnpm postinstall (to generate Prisma client and push schema)",
      );
    }

    process.exit(1);
  }
}

// Parse command line arguments
function parseArgs(): AdminUserArgs {
  const args = process.argv.slice(2);
  const customData: AdminUserArgs = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace("--", "") as keyof AdminUserArgs;
    const value = args[i + 1];

    if (key && value && ["name", "email", "password", "branch"].includes(key)) {
      customData[key] = value;
    }
  }

  return customData;
}

// Show usage information
function showUsage() {
  console.log("📖 Usage:");
  console.log("   pnpm run create-admin");
  console.log(
    '   pnpm run create-admin --name "John Doe" --email "john@company.com" --password "secure123" --branch "headquarters"',
  );
  console.log("\n📝 Available options:");
  console.log('   --name       Admin user full name (default: "Admin User")');
  console.log(
    '   --email      Admin user email (default: "admin@example.com")',
  );
  console.log('   --password   Admin user password (default: "admin123")');
  console.log('   --branch     Admin user branch (default: "headquarters")');
  console.log("\n💡 Examples:");
  console.log(
    '   pnpm run create-admin --email "admin@mycompany.com" --password "mySecurePass"',
  );
  console.log(
    '   pnpm run create-admin --name "System Admin" --email "sysadmin@company.com" --branch "headquarters"',
  );
  console.log("\n🔒 Security Note:");
  console.log(
    "   Change the default password after first login for better security.",
  );
  console.log("\n💡 Duplicate User Note:");
  console.log(
    "   If you get a duplicate email error, the admin user already exists.",
  );
  console.log("   Use a different email or check your existing users.");
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    showUsage();
    process.exit(0);
  }

  const customData = parseArgs();
  await createAdminUser(customData);
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error("Script execution failed:", error);
    process.exit(1);
  });
}

export { createAdminUser };
