import {
  BooleanInput,
  Create,
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
} from "react-admin";

export const ChallengeOptionCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="text" validate={[required()]} label="Texto" />
        <BooleanInput source="correct" label="Opção Correta" />
        <ReferenceInput
          source="challengeId"
          reference="challenges"
          label="Questão"
        >
          <SelectInput optionText="question" validate={[required()]} />
        </ReferenceInput>
        <TextInput source="imageSrc" validate={[required()]} label="Imagem" />
        <TextInput source="audioSrc" validate={[required()]} label="Áudio" />
      </SimpleForm>
    </Create>
  );
};
