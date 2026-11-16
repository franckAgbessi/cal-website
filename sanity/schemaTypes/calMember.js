import { UserIcon } from '@sanity/icons/User';
import { defineField, defineType } from 'sanity';

export const calMember = defineType({
  name: 'calMember',
  title: 'Membre CAL',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'displayName',
      title: 'Nom ou pseudo',
      type: 'string',
      validation: rule => rule.required().max(60),
    }),
    defineField({
      name: 'email',
      title: 'Email de connexion',
      type: 'string',
      validation: rule => rule.required().email(),
    }),
    defineField({
      name: 'password',
      title: 'Mot de passe (ou hash)',
      type: 'string',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Rôle',
      type: 'string',
      initialValue: 'member',
      options: {
        list: [
          { title: 'Membre', value: 'member' },
          { title: 'Éditeur·rice', value: 'editor' },
          { title: 'Administrateur·rice', value: 'admin' },
        ],
        layout: 'radio',
      },
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'active',
      title: 'Compte actif',
      type: 'boolean',
      initialValue: true,
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'createdAt',
      title: 'Date de création',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'displayName',
      subtitle: 'email',
    },
  },
});
