import http from "http";

const PORT = process.env.PORT || 5050;
const API_BASE_URL = process.env.API_URL || `http://127.0.0.1:${PORT}/api`;

export async function runConcurrencyTest(
  resourceId: string,
  userId: string,
  startTimeUtc: string,
  endTimeUtc: string
) {
  console.log("Running Concurrency Test for Double-Booking Prevention...");
  console.log(`Slot range: ${startTimeUtc} -> ${endTimeUtc}`);

  const payload = JSON.stringify({
    resourceId,
    userId,
    startTime: startTimeUtc,
    endTime: endTimeUtc,
  });

  const sendRequest = (): Promise<{ statusCode: number; body: any }> => {
    return new Promise((resolve, reject) => {
      const url = new URL(`${API_BASE_URL}/bookings`);
      const req = http.request(
        url,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payload),
          },
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              resolve({
                statusCode: res.statusCode || 500,
                body: JSON.parse(data),
              });
            } catch (err) {
              resolve({ statusCode: res.statusCode || 500, body: data });
            }
          });
        }
      );

      req.on("error", (err) => reject(err));
      req.write(payload);
      req.end();
    });
  };

  // Launch two concurrent requests at the exact same instant
  const [res1, res2] = await Promise.all([sendRequest(), sendRequest()]);

  console.log(`Request 1 Response: Status ${res1.statusCode}`, res1.body);
  console.log(`Request 2 Response: Status ${res2.statusCode}`, res2.body);

  const statuses = [res1.statusCode, res2.statusCode].sort();

  if (statuses[0] === 201 && statuses[1] === 409) {
    console.log("CONCURRENCY TEST PASSED! Exactly 1 succeeded (201) and 1 was rejected with 409 Conflict.\n");
    return true;
  } else {
    console.error("CONCURRENCY TEST FAILED! Expected one 201 and one 409 status.\n");
    return false;
  }
}
