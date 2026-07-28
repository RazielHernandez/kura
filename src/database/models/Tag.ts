import { BaseEntity } from "./BaseEntity";

export interface Tag extends BaseEntity{

    collectionId: string;

    name: string;

    color?: string;
}