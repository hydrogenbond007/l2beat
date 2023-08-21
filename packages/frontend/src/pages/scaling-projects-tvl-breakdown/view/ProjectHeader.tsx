import React from 'react'

export interface ProjectHeaderProps {
  title: string
  icon?: string
  tvlBreakdownHref: string
  tvlBreakdownDate: string
}

export function ProjectHeader(props: ProjectHeaderProps) {
  return (
    <div className="mt-11 flex flex-col">
      <div className="flex items-center gap-[6px]">
        {props.icon && (
          <img
            className="h-4 w-4 md:h-4 md:w-4"
            src={props.icon}
            alt={`${props.title} logo`}
          />
        )}
        <h1 className="text-base font-medium">
          {props.title}
          <span className="mx-1 text-gray-550">/</span>TVL Breakdown
        </h1>
      </div>
      <div className="mt-[38px] text-3xl font-bold">
        {props.title} breakdown for {props.tvlBreakdownDate}
      </div>
    </div>
  )
}
