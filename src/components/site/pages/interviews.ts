// Gegenereerd door gen-interviews. Elke pagina wordt pas geladen als erom gevraagd wordt.
import type { ComponentType } from "react";

type Loader = () => Promise<{
  InterviewContent: ComponentType;
  meta: { title: string; description: string };
}>;

export const INTERVIEWS: Record<string, Loader> = {
  "antoinette-opstelten-and-claartje-aarts": () =>
    import("./interviews/antoinette-opstelten-and-claartje-aarts"),
  "arie-van-der-vlies-and-thijs-postma": () =>
    import("./interviews/arie-van-der-vlies-and-thijs-postma"),
  "ellen-rose-kambel": () => import("./interviews/ellen-rose-kambel"),
  "esther-en-steffie": () => import("./interviews/esther-en-steffie"),
  "fabian-leijten": () => import("./interviews/fabian-leijten"),
  "hidde-blom": () => import("./interviews/hidde-blom"),
  "inge-hoogesteger": () => import("./interviews/inge-hoogesteger"),
  "iris-van-beers-jan-willem-van-bokhorst": () =>
    import("./interviews/iris-van-beers-jan-willem-van-bokhorst"),
  "jory-de-groot": () => import("./interviews/jory-de-groot"),
  "laura-kistemaker-and-freddi-krullaars": () =>
    import("./interviews/laura-kistemaker-and-freddi-krullaars"),
  "laurens-cramer": () => import("./interviews/laurens-cramer"),
  "marieke-kamphuis-en-machteld-rijnten": () =>
    import("./interviews/marieke-kamphuis-en-machteld-rijnten"),
  "mariska-komproe": () => import("./interviews/mariska-komproe"),
  "marleen-en-daniel": () => import("./interviews/marleen-en-daniel"),
  "nelly-wisse": () => import("./interviews/nelly-wisse"),
  otto: () => import("./interviews/otto"),
  "stefanie-caton": () => import("./interviews/stefanie-caton"),
  "stephanie-van-gerven-en-michiel-van-rijn-van-alkemade": () =>
    import("./interviews/stephanie-van-gerven-en-michiel-van-rijn-van-alkemade"),
  "van-burgerinitiatief-naar-social-enterprise": () =>
    import("./interviews/van-burgerinitiatief-naar-social-enterprise"),
};
