import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { SITE } from "@/lib/siteConfig";

const sections: LegalSection[] = [
  { title: "What Shop Dream Now is", paragraphs: [
    "Shop Dream Now is a separate product-participation feature. It is not a Help Request, a loan, employment or an instalment-payment arrangement, and Givethra does not extend credit.",
  ]},
  { title: "How a listing works", bullets: [
    "Each listing shows the product, image, description, reference market value, contribution per participation, target quantity, funding progress, eligibility rules, selection method, fulfilment conditions and any delivery, geographic or tax limits.",
    "Illustration: a product with a reference value of PKR 10,000 and a target of 50 equal contributions has a contribution of PKR 200 per participation.",
    "When the target is reached, one eligible participant receives the product under the published selection method.",
  ]},
  { title: "No guarantee", paragraphs: [
    "A product is not guaranteed to every participant. Participating means contributing toward the target on these rules; most participants will not receive the product. Participate only with an amount you are comfortable contributing.",
  ]},
  { title: "Selection and fairness", bullets: [
    "The selection method is published for each listing and applied transparently and consistently.",
    "A recipient who has already received a product under the programme may continue to participate but cannot be selected again, if that is the published rule. Their name is recorded as a previous recipient.",
    "Staff, affiliates and anyone connected to a listing are not eligible to be selected.",
  ]},
  { title: "Before a listing launches", paragraphs: [
    "No listing goes live until its contribution calculation, selection method, refund rules, target-failure procedure and fulfilment responsibilities are defined and published.",
  ]},
  { title: "If the target is not reached", paragraphs: [
    "If a listing does not reach its target by its deadline, or is cancelled, contributions are refunded in full to the original payment method or as credits, as stated on the listing.",
  ]},
  { title: "Fulfilment", bullets: [
    "The winner must provide delivery details and any required identity confirmation within the stated period, or another selection may be made.",
    "Delivery limits, taxes, duties and warranty responsibilities are shown on the listing.",
  ]},
  { title: "Legal availability", paragraphs: [
    "Rules on promotional competitions, prize draws and consumer protection differ by country. Shop Dream Now is offered only where we have confirmed it is lawful, and may be unavailable in your location or in app-store versions of Givethra.",
    `Questions: ${SITE.supportEmail}.`,
  ]},
];

export default function ShopDreamNowRulesPage() {
  return <LegalPage title="Shop Dream Now Rules" sections={sections} intro="The rules for product participation. Please read them before contributing." />;
}
