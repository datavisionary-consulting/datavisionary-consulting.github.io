(define (domain haul-truck-dispatch)
  (:requirements :strips :typing :negative-preconditions)

  (:types truck load location)

  (:predicates
    (at ?t - truck ?loc - location)
    (connected ?from - location ?to - location)
    (load-at ?l - load ?loc - location)
    (carrying ?t - truck ?l - load)
    (free ?t - truck)
    (delivered ?l - load)
    (ore ?l - load)
    (waste ?l - load)
    (mill ?loc - location)
    (dump ?loc - location)
  )

  (:action move
    :parameters (?t - truck ?from - location ?to - location)
    :precondition (and (at ?t ?from) (connected ?from ?to))
    :effect (and (at ?t ?to) (not (at ?t ?from)))
  )

  (:action pick-up
    :parameters (?t - truck ?l - load ?loc - location)
    :precondition (and (at ?t ?loc) (load-at ?l ?loc) (free ?t))
    :effect (and (carrying ?t ?l) (not (free ?t)) (not (load-at ?l ?loc)))
  )

  (:action deliver-ore
    :parameters (?t - truck ?l - load ?loc - location)
    :precondition (and (at ?t ?loc) (carrying ?t ?l) (ore ?l) (mill ?loc))
    :effect (and (delivered ?l) (free ?t) (not (carrying ?t ?l)))
  )

  (:action deliver-waste
    :parameters (?t - truck ?l - load ?loc - location)
    :precondition (and (at ?t ?loc) (carrying ?t ?l) (waste ?l) (dump ?loc))
    :effect (and (delivered ?l) (free ?t) (not (carrying ?t ?l)))
  )
)
