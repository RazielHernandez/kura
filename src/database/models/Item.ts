import { BaseEntity } from "./BaseEntity";

export interface Item extends BaseEntity{

    collectionId: string;

    name: string;

    description: string | null;
    
    favorite: boolean;
}