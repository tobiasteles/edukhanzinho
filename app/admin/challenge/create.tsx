import {
  Create,
  NumberInput,
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
} from "react-admin";

export const ChallengeCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="question" validate={[required()]} label="Questão" />
        <SelectInput
        source="type"
        choices={[
           {
            id: "SELECT",
            name: "SELECT"
          },
          {
            id: "ASSIST",
            name: "ASSIST"
          }
        ]}
        validate={[required()]}
        />
        <ReferenceInput source="lessonId" reference="lessons" label="Lição"/>
        <NumberInput source="order" validate={[required()]} label="Ordem" />
      </SimpleForm>
    </Create>
  );
};
