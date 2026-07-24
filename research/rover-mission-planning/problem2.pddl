; Escenario propuesto por el alumno: se agrega una localidad nueva (l6)
; con un tercer mineral, conectada a l3 (el nodo central de la red).
; El dominio no cambia -- unicamente se extiende el problema.
(define (problem rover-mining-p2)
(:domain rover-mining)
(:objects
    l1 l2 l3 l4 l5 l6 - object
    rover1 - object
    mineral1 mineral2 mineral3 - object
)
(:init
    (CONNECTED l1 l3) (CONNECTED l3 l1)
    (CONNECTED l3 l2)
    (CONNECTED l2 l4)
    (CONNECTED l3 l4) (CONNECTED l4 l3)
    (CONNECTED l4 l5) (CONNECTED l5 l4)
    (CONNECTED l3 l6) (CONNECTED l6 l3)   ; nueva localidad, bidireccional con l3

    (LAB l5)

    (at rover1 l4)
    (free rover1)

    (mineral-at mineral1 l1)
    (mineral-at mineral2 l2)
    (mineral-at mineral3 l6)
)
(:goal
    (and
        (analyzed mineral1)
        (analyzed mineral2)
        (analyzed mineral3)
    )
)
)
