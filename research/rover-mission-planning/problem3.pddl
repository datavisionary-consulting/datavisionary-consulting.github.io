; Segunda variante propuesta por el alumno: se agrega un laboratorio
; adicional (l7), cercano al cluster de l1. Esto prueba que el dominio
; generaliza de verdad -- la accion "deliver" funciona en CUALQUIER
; localidad marcada (LAB ?loc), no en una unica localidad fija.
(define (problem rover-mining-p3)
(:domain rover-mining)
(:objects
    l1 l2 l3 l4 l5 l6 l7 - object
    rover1 - object
    mineral1 mineral2 mineral3 - object
)
(:init
    (CONNECTED l1 l3) (CONNECTED l3 l1)
    (CONNECTED l3 l2)
    (CONNECTED l2 l4)
    (CONNECTED l3 l4) (CONNECTED l4 l3)
    (CONNECTED l4 l5) (CONNECTED l5 l4)
    (CONNECTED l3 l6) (CONNECTED l6 l3)
    (CONNECTED l1 l7) (CONNECTED l7 l1)   ; segundo laboratorio, cerca de l1

    (LAB l5)
    (LAB l7)

    (at rover1 l4)
    (free rover1)

    (mineral-at mineral1 l1)
    (mineral-at mineral2 l2)
    (mineral-at mineral3 l6)
)
(:goal
    (and
        (analyzed mineral1)   ; se entrega en el laboratorio mas cercano, l7
        (analyzed mineral2)
        (analyzed mineral3)
    )
)
)
