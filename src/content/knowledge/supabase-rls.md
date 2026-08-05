---
title: Supabase RLS como límite de acceso
description: Diseñar políticas de acceso por fila que expresen reglas de producto de forma verificable.
publishedAt: 2026-07-24
section: knowledge
category: application-security
tags: [supabase, rls, seguridad-de-aplicaciones]
featured: true
draft: false
---

Row Level Security, o RLS, permite expresar en PostgreSQL qué filas puede consultar o modificar cada persona. En una aplicación con Supabase, esta capa debe tratarse como una parte del modelo de producto y no como un ajuste posterior.

Para una herramienta orientada al seguimiento de clientes, estas reglas son un medio técnico para ofrecer una experiencia confiable. El resultado buscado es que cada persona vea únicamente la información que le corresponde, sin convertir la complejidad técnica en una carga para quien usa el producto.

## Empezar por las reglas del dominio

Antes de escribir una política conviene describir el comportamiento en lenguaje directo: quién puede leer, quién puede crear y bajo qué relación puede actualizar o eliminar. Una regla por operación resulta más fácil de razonar que una condición amplia con varios propósitos.

Las tablas que exponen datos mediante la API necesitan RLS activado y políticas explícitas. La ausencia de una política debe producir el resultado más restrictivo; después se habilitan únicamente los casos que el producto requiere.

## Diseñar condiciones comprobables

Las políticas suelen relacionar la identidad autenticada con una columna de propiedad o con una tabla de membresías. Esa relación debe ser estable, estar respaldada por restricciones de datos y evitar supuestos que sólo existen en la interfaz.

Una matriz pequeña ayuda a revisar el diseño: personas propietarias, miembros autorizados y visitantes; frente a lectura, creación, actualización y eliminación. Cada celda se convierte en un caso de prueba positivo o negativo.

## Verificar desde el comportamiento

Las pruebas deben ejecutar operaciones con identidades distintas y confirmar tanto lo permitido como lo rechazado. Probar únicamente el camino exitoso deja sin evidencia el límite más importante.

RLS funciona mejor cuando las reglas son breves, sus nombres explican la intención y los cambios se revisan junto con el modelo de datos. El resultado es una frontera de acceso que puede leerse, probarse y evolucionar con el producto.
