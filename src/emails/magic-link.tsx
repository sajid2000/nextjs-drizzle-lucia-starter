import { Body, Container, Head, Hr, Html, Img, Link, Preview, Section, Tailwind, Text } from "@react-email/components";
import * as React from "react";

import config from "@/config";

export function MagicLinkEmail({ token }: { token: string }) {
  const previewText = `You're been invited to a group!`;
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <React.Fragment>
          <Body className="m-auto bg-white font-sans">
            <Container className="mx-auto my-[40px] w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
              <Section className="mt-[32px]">
                <Img src={`${config.appUrl}/group.jpeg`} width="160" height="48" alt="StarterKit" className="mx-auto my-0" />
              </Section>

              <Section className="my-[32px] text-center">
                <Text className="mb-8 text-[14px] font-medium leading-[24px] text-black">
                  You&apos;re magic link login is below, click to login. group.
                </Text>

                <Text className="text-[14px] font-medium leading-[24px] text-black">
                  <Link
                    href={`${config.appUrl}/api/login/magic?token=${token}`}
                    target="_blank"
                    className="text-[#2754C5] underline"
                  >
                    Login using Magic Link
                  </Link>
                </Text>
              </Section>

              <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />

              <Text className="flex items-center justify-center text-[12px] leading-[24px] text-[#666666]">
                © 2024 {config.appName}. All rights reserved.
              </Text>
            </Container>
          </Body>
        </React.Fragment>
      </Tailwind>
    </Html>
  );
}
