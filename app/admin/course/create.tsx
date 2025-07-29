import { Create, required, SimpleForm, TextInput } from "react-admin"

export const CourseCreate = () => {
   return (
     <Create>
        <SimpleForm>
            <TextInput source="title" validate={[required()]} label="Titulo" />
            <TextInput source="imageSrc" validate={[required()]} label="Imagem" />
           
        </SimpleForm>
    </Create>
   )
}