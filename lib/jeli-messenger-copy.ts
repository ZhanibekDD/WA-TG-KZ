import { messengerCopy as baseMessengerCopy, type MessengerCopy } from "./messenger-copy";

function jeliCopy(copy: MessengerCopy): MessengerCopy {
  return {
    ...copy,
    demoDetails: copy.demoDetails.replaceAll("Qazyna", "JELI"),
  };
}

export const messengerCopy = {
  ru: jeliCopy(baseMessengerCopy.ru),
  kk: jeliCopy(baseMessengerCopy.kk),
};

export type { MessengerCopy };
