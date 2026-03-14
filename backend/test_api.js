const fs = require('fs');
const path = require('path');

async function testAPI() {
    console.log("Testing POST /api/users/signup...");

    // Note: normally we test auth flows, but I just want to make sure the endpoint works
    const res = await fetch("http://localhost:5000/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "Test Provider",
            email: "provider@test.com",
            password: "password123",
            role: "provider",
            serviceCategory: "Plumbing",
            serviceDescription: "Expert plumbing services",
            experience: "5 Years",
            phone: "9876543210"
        })
    });

    const data = await res.json();
    console.log(data);
}

testAPI().catch(console.error);
