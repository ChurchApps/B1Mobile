import { ChurchInterface, LinkInterface } from "./Interfaces";

export class CachedData {
    static church: ChurchInterface | null = null;
    static tabs: LinkInterface[] | null = null;
}
