import { BaseEntity } from "./BaseEntity";

export interface CustomList extends BaseEntity{

    name: string;

    icon?: string;

    color?: string;
}