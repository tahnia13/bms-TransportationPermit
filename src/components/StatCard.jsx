function StatCard({
  title,
  value,
  description,
  icon,
  type = 'default',
}) {

  const styles = {
    default: 'bg-white',
    green: 'bg-[#12372A] text-white',
    yellow: 'bg-[#D7FF3F]',
  }

  return (
    <div
      className={`rounded-2xl p-6 shadow-sm ${styles[type]}`}
    >

      <div className="flex items-start justify-between">

        <div>
          <p className={`text-sm ${
            type === 'green'
              ? 'text-white/60'
              : 'text-gray-400'
          }`}>
            {title}
          </p>

          <h3 className="mt-2 text-3xl font-bold">
            {value}
          </h3>

          <p className={`mt-2 text-xs ${
            type === 'green'
              ? 'text-white/50'
              : 'text-gray-400'
          }`}>
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/5 text-xl">
          {icon}
        </div>

      </div>

    </div>
  )
}

export default StatCard