"use client";

import {  Edit, required, SimpleForm, TextInput } from "react-admin"

export const CourseEdit = () => {
   return (
     <Edit>
        <SimpleForm>
            <TextInput source="id" validate={[required()]} label="Id" />
            <TextInput source="title" validate={[required()]} label="Titulo" />
            <TextInput source="imageSrc" validate={[required()]} label="Imagem" />
           
        </SimpleForm>
    </Edit>
   )
}