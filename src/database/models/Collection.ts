import { BaseEntity } from "./BaseEntity";

export interface Collection extends BaseEntity{

    name: string;

    icon: string | null;

    color: string | null;

    description: string | null;

    sortOrder: number;
}