import { BaseEntity } from "./BaseEntity";

export interface Collection extends BaseEntity{

    name: string;

    icon?: string;

    color?: string;

    description?: string;

    sortOrder: number;
}