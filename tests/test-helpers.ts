type TestCase = {
  name: string;
  run: () => void | Promise<void>;
};

const tests: TestCase[] = [];

export function test(name: string, run: TestCase["run"]) {
  tests.push({ name, run });
}

export async function runTests() {
  let failed = 0;

  for (const testCase of tests) {
    try {
      await testCase.run();
      console.log(`ok - ${testCase.name}`);
    } catch (error) {
      failed += 1;
      console.error(`not ok - ${testCase.name}`);
      console.error(error);
    }
  }

  console.log(`${tests.length - failed}/${tests.length} tests passed`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}
